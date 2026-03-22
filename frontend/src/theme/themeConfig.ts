import type { ThemeConfig } from 'antd';

export const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: '#396AFF',
    colorSuccess: '#16DBCC',
    colorWarning: '#FFBB38',
    colorError: '#FE5C73',
    colorInfo: '#396AFF',
    borderRadius: 15,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
    colorBgContainer: '#ffffff',
    colorBgLayout: '#F5F7FA',
    colorBorder: '#E6EFF5',
    colorText: '#232323',
    colorTextSecondary: '#718EBF',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
  },
  components: {
    Button: {
      borderRadius: 12,
      controlHeight: 40,
      fontWeight: 500,
    },
    Card: {
      borderRadiusLG: 20,
      boxShadowTertiary: '0 2px 10px rgba(0, 0, 0, 0.04)',
    },
    Table: {
      borderRadius: 15,
      headerBg: '#ffffff',
      headerColor: '#718EBF',
    },
    Menu: {
      itemBorderRadius: 0,
      itemMarginInline: 0,
      itemHeight: 52,
    },
    Input: {
      borderRadius: 12,
      controlHeight: 44,
    },
    Select: {
      borderRadius: 12,
    },
    Modal: {
      borderRadiusLG: 20,
    },
    Tabs: {
      inkBarColor: '#396AFF',
      itemActiveColor: '#396AFF',
      itemHoverColor: '#396AFF',
    },
  },
};

export const darkTheme: ThemeConfig = {
  token: {
    colorPrimary: '#396AFF',
    colorSuccess: '#16DBCC',
    colorWarning: '#FFBB38',
    colorError: '#FE5C73',
    colorInfo: '#396AFF',
    borderRadius: 15,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
    colorBgContainer: '#1f2937',
    colorBgLayout: '#111827',
    colorBorder: '#374151',
    colorText: '#f9fafb',
    colorTextSecondary: '#9ca3af',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
  },
  components: {
    Button: {
      borderRadius: 12,
      controlHeight: 40,
      fontWeight: 500,
    },
    Card: {
      borderRadiusLG: 20,
    },
    Menu: {
      itemBorderRadius: 0,
      itemMarginInline: 0,
      itemHeight: 52,
      darkItemBg: '#1f2937',
      darkSubMenuItemBg: '#111827',
    },
  },
};

export type ThemeMode = 'light' | 'dark';
