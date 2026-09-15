const darkBgColor = "#e4dcc8";
const lightBgColor = "#fcf5e4";

export const TypewriterTheme = {
  token: {
    fontFamily: '"iA Writer Mono V", "Courier New", Courier, monospace',
    fontFamilyCode: '"iA Writer Mono V", "Courier New", Courier, monospace',

    colorPrimary: "#979795",
    colorWarning: "#c99635",
    colorError: "#b04a4a",
    colorInfo: "#4a708b",

    colorText: "#2e2e2e",
    colorTextDescription: "#595959",
    colorBgContainer: lightBgColor,
    colorBgLayout: "#f4f4f4",

    colorBorder: "#d9d9d9",
    colorBorderSecondary: "#e8e8e8",

    borderRadius: 2,
    borderRadiusXS: 1,
    borderRadiusSM: 1,
    borderRadiusLG: 4,

    controlOutline: "rgba(0, 0, 0, 0.04)",
    colorBgTextHover: "rgba(0, 0, 0, 0.04)",
    colorBgTextActive: "rgba(0, 0, 0, 0.08)",
  },
  components: {
    Button: {
      // Кнопки делаем более строгими
      borderRadius: 2,
      controlHeight: 34,
      fontFamily: '"iA Writer Mono V", monospace',
    },
    Input: {
      // Поля ввода как на печатной машинке
      borderRadius: 0, // Прямые углы
      colorBgContainer: "#ffffff",
    },
    Typography: {
      // Специфика для текста
      colorText: "#2e2e2e",
    },
    Layout: {
      bodyBg: darkBgColor,
      headerBg: lightBgColor,
      siderBg: lightBgColor,
    },
    Modal: {
      contentBg: lightBgColor,
    },
    Select: {
      colorBgContainer: "#fff",
    },
    Tree: {
      indentSize: 12,
      paddingXS: 2,
      fontSize: 16,
    },
  },
};
