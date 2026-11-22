import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  Badge,
  Button,
  Card,
  Divider,
  Empty,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import useApp from "antd/es/app/useApp";
import { AuditOutlined, EditOutlined, GiftOutlined } from "@ant-design/icons";
import { pb } from "../../../../API/PocketBase";
import { COLLECTIONS } from "../../../../API/collections";
import MainLayout from "../../../../components/MainLayout";
import { useAuth } from "../../../../contexts/AuthContext";
import { ROLES } from "../../../../types/Role";
import { RoleGuard } from "../../../../utils/RoleGuard";
import {
  fetchAchievementApplications,
  fetchAchievementGraphs,
  fetchAchievements,
  fetchCharacterAchievements,
  fetchCharacters,
  toAchievement,
  toTrees,
} from "./api";
import type { AchievementCharacter } from "./api";
import AchievementApplicationsDrawer from "./AchievementApplicationsDrawer";
import AchievementEditor from "./AchievementEditor";
import AchievementNode, { AchievementImage } from "./AchievementNode";
import { layoutAchievements, NODE_HEIGHT, NODE_WIDTH } from "./layout";
import type { PositionedAchievement } from "./layout";
import type {
  Achievement,
  AchievementApplicationRecord,
  AchievementApplicationStatus,
  AchievementRecord,
  AchievementStatus,
  AchievementTree,
  CharacterAchievementRecord,
} from "./types";
import "./achievements.css";

interface GraphEdge {
  id: string;
  parent: PositionedAchievement;
  child: PositionedAchievement;
}

const EMPTY_TREE: AchievementTree = {
  id: "",
  title: "",
  description: "",
  achievements: [],
  isolatedLayout: "line",
  isolatedColumns: 3,
};

function AchievementLink({
  node,
  onSelect,
}: {
  node: PositionedAchievement;
  onSelect: (id: string) => void;
}) {
  return (
    <Button type="link" size="small" onClick={() => onSelect(node.id)}>
      {node.title}
    </Button>
  );
}

export default function AchievementsPage() {
  const { message } = useApp();
  const { user, role } = useAuth();

  const {
    data: graphs = [],
    isLoading: graphsLoading,
    error: graphsError,
    mutate: mutateGraphs,
  } = useSWR(COLLECTIONS.achievementGraphs, fetchAchievementGraphs);
  const {
    data: achievementRecords = [],
    isLoading: achievementsLoading,
    error: achievementsError,
    mutate: mutateAchievements,
  } = useSWR(COLLECTIONS.achievements, fetchAchievements);
  // Прогресс хранится не у пользователя, а у персонажа. Для мастера PB
  // возвращает всех персонажей, для игрока — только его собственных.
  const { data: characters = [] } = useSWR<AchievementCharacter[]>(
    user ? [COLLECTIONS.characters, "achievement-progress"] : null,
    fetchCharacters,
  );

  const [treeIndex, setTreeIndex] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  // Выбор запоминается для каждого набора, чтобы переключение туда-обратно
  // не сбрасывало открытое достижение.
  const [selectedByTree, setSelectedByTree] = useState<Record<string, string>>(
    {},
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [progressCharacterId, setProgressCharacterId] = useState("");
  const [applicationsOpen, setApplicationsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [busyApplicationId, setBusyApplicationId] = useState<string | null>(
    null,
  );

  // Пока персонаж не выбран, прогресс не подсвечивается: гостю и игроку без
  // персонажей показываем нейтральные карточки.
  const activeCharacter =
    characters.find((item) => item.id === progressCharacterId) ?? characters[0];
  const characterId = activeCharacter?.id ?? "";
  const { data: progress = [], mutate: mutateProgress } = useSWR<
    CharacterAchievementRecord[]
  >(
    characterId ? [COLLECTIONS.characterAchievements, characterId] : null,
    ([, id]) => fetchCharacterAchievements(String(id)),
  );
  const { data: applications = [], mutate: mutateApplications } = useSWR<
    AchievementApplicationRecord[]
  >(
    user ? COLLECTIONS.achievementApplications : null,
    fetchAchievementApplications,
  );

  const trees = useMemo(
    () => toTrees(graphs, achievementRecords),
    [graphs, achievementRecords],
  );
  const tree = trees[treeIndex] ?? trees[0] ?? EMPTY_TREE;
  const layout = useMemo(
    () =>
      layoutAchievements(tree.achievements, {
        isolatedLayout: tree.isolatedLayout,
        isolatedColumns: tree.isolatedColumns,
      }),
    [tree.achievements, tree.isolatedLayout, tree.isolatedColumns],
  );

  const nodeById = useMemo(
    () => new Map(layout.nodes.map((node) => [node.id, node])),
    [layout.nodes],
  );

  const edges = useMemo<GraphEdge[]>(
    () =>
      layout.nodes.flatMap((child) =>
        child.parents.flatMap((parentId) => {
          const parent = nodeById.get(parentId);
          return parent
            ? [{ id: `${parentId}-${child.id}`, parent, child }]
            : [];
        }),
      ),
    [layout.nodes, nodeById],
  );

  const childrenByParent = useMemo(() => {
    const result = new Map<string, PositionedAchievement[]>();
    for (const edge of edges) {
      const list = result.get(edge.parent.id) ?? [];
      list.push(edge.child);
      result.set(edge.parent.id, list);
    }
    return result;
  }, [edges]);

  const unlockedIds = useMemo(
    () =>
      new Set(
        progress
          .filter((item) => item.unlocked)
          .map((item) => item.achievement),
      ),
    [progress],
  );
  const statusFor = (id: string): AchievementStatus => {
    if (!characterId) return "neutral";
    return unlockedIds.has(id) ? "unlocked" : "locked";
  };

  const selectedId = selectedByTree[tree.id] ?? layout.nodes[0]?.id ?? "";
  const selected = nodeById.get(selectedId);
  const parents = selected
    ? selected.parents
        .map((id) => nodeById.get(id))
        .filter((node): node is PositionedAchievement => Boolean(node))
    : [];
  const children = selected ? (childrenByParent.get(selected.id) ?? []) : [];

  const selectedProgress = selected
    ? progress.find(
        (item) =>
          item.achievement === selected.id && item.character === characterId,
      )
    : undefined;
  const pendingApplications = applications.filter(
    (item) => item.status === "pending",
  );
  const myPendingApplication = selected
    ? applications.find(
        (item) =>
          item.status === "pending" &&
          item.character === characterId &&
          item.achievement === selected.id,
      )
    : undefined;

  const handleSelect = (id: string) => {
    setSelectedByTree((current) => ({ ...current, [tree.id]: id }));
    setDetailsOpen(true);
  };

  const handleTreeChange = (index: number) => {
    setTreeIndex(index);
    setDetailsOpen(false);
  };

  const handleTreePatch = async (patch: Partial<AchievementTree>) => {
    try {
      const payload: {
        title?: string;
        description?: string;
        isolated_layout?: string;
        isolated_columns?: number;
      } = {};
      if (patch.title !== undefined) payload.title = patch.title;
      if (patch.description !== undefined)
        payload.description = patch.description;
      if (patch.isolatedLayout !== undefined)
        payload.isolated_layout = patch.isolatedLayout;
      if (patch.isolatedColumns !== undefined)
        payload.isolated_columns = patch.isolatedColumns;

      await pb
        .collection(COLLECTIONS.achievementGraphs)
        .update(tree.id, payload);
      await mutateGraphs();
      message.success("Настройки набора сохранены");
    } catch {
      message.error("Не удалось сохранить настройки набора");
    }
  };

  const handleCreateTree = async () => {
    try {
      const created = await pb
        .collection(COLLECTIONS.achievementGraphs)
        .create({
          title: "Новый граф",
          description: "Описание нового графа достижений",
          isolated_layout: "line",
          isolated_columns: 3,
          sort: graphs.length + 1,
        });
      await mutateGraphs();
      setTreeIndex(graphs.length);
      setDetailsOpen(false);
      message.success("Новый граф создан");
      return created.id;
    } catch {
      message.error("Не удалось создать граф");
      throw new Error("create graph failed");
    }
  };

  const handleAchievementSave = async (
    achievement: Achievement,
  ): Promise<Achievement> => {
    const payload = {
      graph: tree.id,
      title: achievement.title,
      description: achievement.description,
      reward: achievement.reward,
      image: achievement.image,
      parents: achievement.parents,
      ...(achievement.id ? {} : { sort: tree.achievements.length + 1 }),
    };
    const record = achievement.id
      ? await pb
          .collection(COLLECTIONS.achievements)
          .update<AchievementRecord>(achievement.id, payload)
      : await pb
          .collection(COLLECTIONS.achievements)
          .create<AchievementRecord>(payload);
    await mutateAchievements();
    return toAchievement(record);
  };

  const handleAchievementDelete = async (id: string) => {
    // PB не чистит self-relation автоматически — убираем ссылки у детей.
    for (const item of achievementRecords) {
      if (item.parents?.includes(id)) {
        await pb.collection(COLLECTIONS.achievements).update(item.id, {
          parents: item.parents.filter((parentId) => parentId !== id),
        });
      }
    }
    await pb.collection(COLLECTIONS.achievements).delete(id);
    await mutateAchievements();
  };

  const handleRefresh = async () => {
    await Promise.all([
      mutateGraphs(),
      mutateAchievements(),
      mutateProgress(),
      mutateApplications(),
    ]);
  };

  const handleToggleProgress = async () => {
    if (!selected || !characterId) return;
    try {
      if (selectedProgress) {
        await pb
          .collection(COLLECTIONS.characterAchievements)
          .update(selectedProgress.id, {
            unlocked: !selectedProgress.unlocked,
            unlocked_at: selectedProgress.unlocked
              ? null
              : new Date().toISOString(),
          });
      } else {
        await pb.collection(COLLECTIONS.characterAchievements).create({
          character: characterId,
          achievement: selected.id,
          unlocked: true,
          unlocked_at: new Date().toISOString(),
        });
      }
      await mutateProgress();
      message.success("Прогресс обновлён");
    } catch {
      message.error("Не удалось обновить прогресс");
    }
  };

  const handleSubmitApplication = async () => {
    if (!selected || !characterId) return;
    if (myPendingApplication) {
      message.warning("Заявка уже отправлена");
      return;
    }
    try {
      await pb.collection(COLLECTIONS.achievementApplications).create({
        character: characterId,
        achievement: selected.id,
        comment: comment.trim(),
        status: "pending",
      });
      setComment("");
      await mutateApplications();
      message.success("Заявка отправлена мастеру");
    } catch {
      message.error("Не удалось отправить заявку");
    }
  };

  const handleApplicationDecision = async (
    id: string,
    decision: AchievementApplicationStatus,
  ) => {
    const application = applications.find((item) => item.id === id);
    if (!application || decision === "pending") return;

    setBusyApplicationId(id);
    try {
      if (decision === "approved") {
        const existing = await pb
          .collection(COLLECTIONS.characterAchievements)
          .getFullList<CharacterAchievementRecord>({
            filter: `character = "${application.character}" && achievement = "${application.achievement}"`,
          });
        if (existing.length > 0) {
          await pb
            .collection(COLLECTIONS.characterAchievements)
            .update(existing[0].id, {
              unlocked: true,
              unlocked_at: new Date().toISOString(),
            });
        } else {
          await pb.collection(COLLECTIONS.characterAchievements).create({
            character: application.character,
            achievement: application.achievement,
            unlocked: true,
            unlocked_at: new Date().toISOString(),
          });
        }
      }

      await pb.collection(COLLECTIONS.achievementApplications).update(id, {
        status: decision,
        reviewed_by: user?.id ?? null,
        reviewed_at: new Date().toISOString(),
      });
      await Promise.all([mutateApplications(), mutateProgress()]);
      message.success(
        decision === "approved" ? "Заявка одобрена" : "Заявка отклонена",
      );
    } catch {
      message.error("Не удалось обработать заявку");
    } finally {
      setBusyApplicationId(null);
    }
  };

  const isLoading = graphsLoading || achievementsLoading;
  const error = graphsError || achievementsError;

  return (
    <MainLayout>
      <div className="mb-4 ">
        <Typography.Title level={2} className="!mb-1">
          Достижения
        </Typography.Title>
        <Typography.Paragraph className="my-4" type="secondary">
          Здесь можно отслеживать достижения своих персонажей в рамках игры на
          гильдийских ваншотах. Возможно, это будет влиять на развитие ваших
          персонажей. После совершения ключевых действий в ходе игры вы можете
          самостоятельно подать заявку и один из мастеров её согласует.
        </Typography.Paragraph>

        <div className="flex flex-col gap-4">
          <RoleGuard allowedRoles={[ROLES.master]}>
            <Space size={8} wrap>
              <span className="mr-1 text-[11px] uppercase tracking-widest text-[#979795]">
                Для мастера
              </span>
              <Button
                icon={<EditOutlined />}
                onClick={() => setEditorOpen(true)}
              >
                Редактировать
              </Button>
              <Badge count={pendingApplications.length} overflowCount={99}>
                <Button
                  icon={<AuditOutlined />}
                  onClick={() => setApplicationsOpen(true)}
                >
                  Заявки
                </Button>
              </Badge>
            </Space>
          </RoleGuard>
        </div>
      </div>

      {isLoading ? (
        <Spin />
      ) : error ? (
        <Empty description="Не удалось загрузить графы достижений" />
      ) : trees.length === 0 ? (
        <Card>
          <Empty description="Графов пока нет — создайте первый в редакторе" />
        </Card>
      ) : selected ? (
        <Card
          title={
            <div className="my-4">
              <Space size={8} wrap>
                {trees.map((item, index) => (
                  <Button
                    key={item.id}
                    type={index === treeIndex ? "primary" : "default"}
                    onClick={() => handleTreeChange(index)}
                  >
                    {item.title}
                  </Button>
                ))}
              </Space>
              {tree.description && (
                <div className="mt-2 text-xs font-normal text-[#595959]">
                  {tree.description}
                </div>
              )}
            </div>
          }
          extra={
            user &&
            characters.length > 0 && (
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-widest text-[#979795] ml-1">
                  Персонаж
                </span>
                <Select
                  value={characterId}
                  onChange={setProgressCharacterId}
                  options={characters.map((item) => ({
                    value: item.id,
                    label: item.name,
                  }))}
                  placeholder="Выберите персоpнажа"
                  style={{ width: 240 }}
                />
              </div>
            )
          }
          styles={{ body: { padding: 0 } }}
        >
          <div className="achievements-graph overflow-x-auto">
            <div
              className="relative"
              style={{ width: layout.width, height: layout.height }}
            >
              <svg
                width={layout.width}
                height={layout.height}
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
              >
                <defs>
                  <marker
                    id="achievement-arrow"
                    markerWidth="8"
                    markerHeight="8"
                    refX="6"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path d="M0,0 L0,6 L7,3 z" fill="#b9a98a" />
                  </marker>
                </defs>
                {edges.map((edge) => {
                  const startX = edge.parent.x + NODE_WIDTH / 2;
                  const startY = edge.parent.y + NODE_HEIGHT;
                  const endX = edge.child.x + NODE_WIDTH / 2;
                  const endY = edge.child.y - 6;
                  const bend = Math.max(24, (endY - startY) / 2);

                  return (
                    <path
                      key={edge.id}
                      d={`M ${startX} ${startY} C ${startX} ${startY + bend}, ${endX} ${endY - bend}, ${endX} ${endY}`}
                      fill="none"
                      stroke="#b9a98a"
                      strokeWidth={1.5}
                      strokeOpacity={0.6}
                      markerEnd="url(#achievement-arrow)"
                    />
                  );
                })}
              </svg>

              {layout.nodes.map((node) => (
                <AchievementNode
                  key={node.id}
                  achievement={node}
                  status={statusFor(node.id)}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <Empty description="В этом наборе пока нет достижений" />
        </Card>
      )}

      {selected && (
        <Modal
          open={detailsOpen}
          onCancel={() => setDetailsOpen(false)}
          footer={null}
          width={560}
          title="Карточка достижения"
        >
          <div className="flex items-start gap-4">
            <AchievementImage
              image={selected.image}
              title={selected.title}
              size={88}
            />
            <div className="min-w-0">
              <div className="text-xl font-bold leading-tight">
                {selected.title}
              </div>
              <Space size={4} wrap className="mt-2">
                <Tag>Уровень {selected.depth + 1}</Tag>
                {characterId && (
                  <Tag
                    color={unlockedIds.has(selected.id) ? "gold" : "default"}
                  >
                    {unlockedIds.has(selected.id) ? "Получено" : "Не получено"}
                  </Tag>
                )}
                {myPendingApplication && (
                  <Tag color="processing">Заявка на согласовании</Tag>
                )}
              </Space>
            </div>
          </div>

          <Typography.Paragraph className="!mb-3 !mt-4">
            {selected.description}
          </Typography.Paragraph>

          <div className="flex items-start gap-2 text-sm">
            <GiftOutlined className="mt-1 text-[#c99635]" />
            <span>
              <span className="text-[#595959]">Награда: </span>
              <b>{selected.reward}</b>
            </span>
          </div>

          <Divider style={{ margin: "16px 0" }} />

          <div className="text-[11px] uppercase tracking-widest text-[#979795]">
            Требуется
          </div>
          <div className="mt-1">
            {parents.length > 0 ? (
              parents.map((node) => (
                <AchievementLink
                  key={node.id}
                  node={node}
                  onSelect={handleSelect}
                />
              ))
            ) : (
              <span className="text-sm text-[#595959]">
                Корневое достижение
              </span>
            )}
          </div>

          <div className="mt-3 text-[11px] uppercase tracking-widest text-[#979795]">
            Открывает
          </div>
          <div className="mt-1">
            {children.length > 0 ? (
              children.map((node) => (
                <AchievementLink
                  key={node.id}
                  node={node}
                  onSelect={handleSelect}
                />
              ))
            ) : (
              <span className="text-sm text-[#595959]">Финальное звено</span>
            )}
          </div>

          {role === ROLES.master && (
            <>
              <Divider style={{ margin: "16px 0" }} />
              <div className="text-[11px] uppercase tracking-widest text-[#979795]">
                Прогресс персонажа
              </div>
              <Space className="mt-2" wrap>
                <span className="text-sm">
                  {activeCharacter
                    ? activeCharacter.name
                    : "персонаж не выбран"}
                </span>
                <Button disabled={!characterId} onClick={handleToggleProgress}>
                  {selectedProgress?.unlocked
                    ? "Отметить не полученным"
                    : "Отметить полученным"}
                </Button>
              </Space>
            </>
          )}

          {user && role !== ROLES.master && characterId && (
            <>
              <Divider style={{ margin: "16px 0" }} />
              <div className="text-[11px] uppercase tracking-widest text-[#979795]">
                Заявка на достижение
              </div>
              {myPendingApplication ? (
                <Space direction="vertical" size={4} className="mt-2 w-full">
                  <Tag color="processing">Заявка уже отправлена</Tag>
                  {myPendingApplication.comment && (
                    <span className="text-xs text-[#595959]">
                      Ваш комментарий: {myPendingApplication.comment}
                    </span>
                  )}
                </Space>
              ) : (
                <Space direction="vertical" size={8} className="mt-2 w-full">
                  <Input.TextArea
                    rows={2}
                    placeholder="Комментарий для мастера (необязательно)"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                  />
                  <Button type="primary" onClick={handleSubmitApplication}>
                    Отметить достижение
                  </Button>
                </Space>
              )}
            </>
          )}
        </Modal>
      )}

      <RoleGuard allowedRoles={[ROLES.master]}>
        <AchievementEditor
          open={editorOpen}
          tree={tree}
          onClose={() => setEditorOpen(false)}
          onTreePatch={handleTreePatch}
          onAchievementSave={handleAchievementSave}
          onAchievementDelete={handleAchievementDelete}
          onRefresh={handleRefresh}
          onCreateTree={handleCreateTree}
        />
      </RoleGuard>

      <RoleGuard allowedRoles={[ROLES.master]}>
        <AchievementApplicationsDrawer
          open={applicationsOpen}
          onClose={() => setApplicationsOpen(false)}
          applications={applications}
          characters={characters}
          achievements={achievementRecords}
          busyId={busyApplicationId}
          onApprove={(id) => void handleApplicationDecision(id, "approved")}
          onReject={(id) => void handleApplicationDecision(id, "rejected")}
        />
      </RoleGuard>
    </MainLayout>
  );
}
