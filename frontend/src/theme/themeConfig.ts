import type { ThemeConfig } from 'antd';

export const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: '#2563eb',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#3b82f6',
    borderRadius: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f7fa',
    colorBorder: '#e5e7eb',
    colorText: '#1f2937',
    colorTextSecondary: '#6b7280',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
  },
  components: {
    Button: {
      borderRadius: 6,
      controlHeight: 36,
      fontWeight: 500,
    },
    Card: {
      borderRadiusLG: 12,
      boxShadowTertiary: '0 1px 3px rgba(0, 0, 0, 0.06)',
    },
    Table: {
      borderRadius: 8,
      headerBg: 'linear-gradient(180deg, #fafbfc 0%, #f3f4f6 100%)',
    },
    Menu: {
      itemBorderRadius: 6,
      itemMarginInline: 8,
    },
    Input: {
      borderRadius: 6,
    },
    Select: {
      borderRadius: 6,
    },
    Modal: {
      borderRadiusLG: 16,
    },
    Tabs: {
      inkBarColor: '#2563eb',
      itemActiveColor: '#2563eb',
      itemHoverColor: '#3b82f6',
    },
  },
};

export const darkTheme: ThemeConfig = {
  token: {
    colorPrimary: '#3b82f6',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#60a5fa',
    borderRadius: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    colorBgContainer: '#1f2937',
    colorBgLayout: '#111827',
    colorBorder: '#374151',
    colorText: '#f9fafb',
    colorTextSecondary: '#9ca3af',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
  },
  components: {
    Button: {
      borderRadius: 6,
      controlHeight: 36,
      fontWeight: 500,
    },
    Card: {
      borderRadiusLG: 12,
    },
    Menu: {
      itemBorderRadius: 6,
      itemMarginInline: 8,
      darkItemBg: '#1f2937',
      darkSubMenuItemBg: '#111827',
    },
  },
};

export type ThemeMode = 'light' | 'dark';
