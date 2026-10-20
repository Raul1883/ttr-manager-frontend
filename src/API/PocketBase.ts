import PocketBase from "pocketbase";
import config from "../config";

export const pb = new PocketBase(config.pbApiUrl);

// ---------------------------------------------------------------------------
// Глобальная поддержка свежести сессии.
//
// Раньше сайт «иногда ломался» и лечился только logout + login:
// JWT протухал (или отзывался на сервере), при этом UI продолжал считать
// пользователя залогиненным, а все запросы падали с 401. Теперь:
//  - перед каждым запросом просроченный токен тихо освежается (beforeSend);
//  - если сервер всё равно ответил 401 — последняя попытка освежить сессию,
//    при неудаче сессия закрывается, и PrivateRoute отправит на /login;
//  - сетевые сбои, 429 и 5xx сессию не трогают (раньше любой сбой разлоганивал).
// ---------------------------------------------------------------------------

const AUTH_ENDPOINT_RE = /\/auth-(refresh|with-)/;
const SESSION_DEAD_STATUSES = [401, 403, 404];

let refreshPromise: Promise<boolean> | null = null;

/**
 * Пробует обновить токен (параллельные вызовы складываются в один запрос).
 * true — токен свежий, можно продолжать.
 * false — обновить не удалось: если сервер ответил 401/403/404, сессия уже
 *         закрыта (authStore.clear), иначе это временный сбой (сеть, 429,
 *         5xx) и сессия сохранена.
 * Никогда не бросает исключения.
 */
export const refreshAuth = (): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = pb
      .collection("users")
      .authRefresh()
      .then(() => true)
      .catch((err) => {
        if (SESSION_DEAD_STATUSES.includes(err?.status)) {
          pb.authStore.clear(); // onChange уведомит AuthContext
        }
        return false;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// Просроченный токен не должен долетать до сервера: освежаем и подставляем
// свежий заголовок; если освежить не удалось — убираем протухший заголовок,
// чтобы запрос ушёл как гостевой, а не с заведомо невалидной авторизацией.
pb.beforeSend = async (url, options) => {
  if (
    !AUTH_ENDPOINT_RE.test(url) &&
    pb.authStore.token &&
    !pb.authStore.isValid
  ) {
    const fresh = await refreshAuth();
    const headers = {
      ...(options.headers as Record<string, string> | undefined),
    };
    if (fresh) {
      headers.Authorization = pb.authStore.token;
    } else {
      delete headers["Authorization"];
    }
    options.headers = headers;
  }
  return { url, options };
};

// Страховка: 401 при клиентски «валидном» токене (сменился секрет PB,
// удалён пользователь и т.п.) — освежаем сессию; при неудаче она закроется,
// и PrivateRoute отправит пользователя на /login.
pb.afterSend = async (response, data) => {
  if (
    response.status === 401 &&
    pb.authStore.token &&
    !AUTH_ENDPOINT_RE.test(response.url)
  ) {
    await refreshAuth();
  }
  return data;
};
