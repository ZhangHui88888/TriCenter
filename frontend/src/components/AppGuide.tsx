import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Select, Tour, message } from 'antd';
import { CloseCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
  GUIDE_MODULE_OPTIONS,
  ENTERPRISE_GUIDE_DETAIL_START_INDEX,
  ENTERPRISE_GUIDE_DETAIL_TAB_KEYS,
  ENTERPRISE_GUIDE_TAB_EVENT,
  ENTERPRISE_GUIDE_TAB_STEPS_START_INDEX,
  getGuideModuleForPathname,
  GUIDE_MODULES,
  isEnterpriseDetailPath,
  pickFirstEnterpriseIdFromListTable,
  resolveGuidePath,
} from '@/components/appGuideConfig';

function AppGuide() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  /** 企业管理：列表↔详情跳转后恢复的步骤（3=详情第 4 步，2=列表第 3 步） */
  const [pendingEnterpriseStep, setPendingEnterpriseStep] = useState<number | null>(null);
  const resolvedPath = resolveGuidePath(location.pathname);
  const activePath = pendingPath ?? resolvedPath ?? GUIDE_MODULES[0].path;
  const activeModule = getGuideModuleForPathname(location.pathname);

  const steps = useMemo(
    () =>
      activeModule.steps.map((step) => {
        const targetElement =
          typeof document === 'undefined' ? null : document.querySelector<HTMLElement>(step.selector);

        return {
          title: step.title,
          description: step.description,
          placement: step.placement,
          target: targetElement ? (() => targetElement) : null,
        };
      }),
    [activeModule, location.pathname, open, current],
  );

  const closeGuide = () => {
    setOpen(false);
    setCurrent(0);
    setPendingPath(null);
    setPendingEnterpriseStep(null);
  };

  const startGuide = (path: string) => {
    if (path === resolvedPath) {
      const start =
        path === '/enterprise' && isEnterpriseDetailPath(location.pathname)
          ? ENTERPRISE_GUIDE_DETAIL_START_INDEX
          : 0;
      setCurrent(start);
      setOpen(true);
      return;
    }

    setOpen(false);
    setCurrent(0);
    setPendingPath(path);
    navigate(path);
  };

  useEffect(() => {
    if (!pendingPath) return;
    if (resolveGuidePath(location.pathname) !== pendingPath) return;

    const timer = globalThis.setTimeout(() => {
      setCurrent(0);
      setOpen(true);
      setPendingPath(null);
    }, 240);

    return () => globalThis.clearTimeout(timer);
  }, [location.pathname, pendingPath]);

  useEffect(() => {
    if (pendingEnterpriseStep === null) return;

    if (pendingEnterpriseStep === 2 && location.pathname === '/enterprise') {
      const timer = globalThis.setTimeout(() => {
        setCurrent(2);
        setPendingEnterpriseStep(null);
      }, 320);
      return () => globalThis.clearTimeout(timer);
    }

    if (pendingEnterpriseStep === ENTERPRISE_GUIDE_DETAIL_START_INDEX && isEnterpriseDetailPath(location.pathname)) {
      let cancelled = false;
      const intervalId = globalThis.setInterval(() => {
        if (cancelled) return;
        const el = document.querySelector('[data-tour="enterprise-detail-toolbar"]');
        if (el) {
          setCurrent(ENTERPRISE_GUIDE_DETAIL_START_INDEX);
          setPendingEnterpriseStep(null);
          globalThis.clearInterval(intervalId);
        }
      }, 120);
      const cap = globalThis.setTimeout(() => {
        if (cancelled) return;
        globalThis.clearInterval(intervalId);
        setCurrent(ENTERPRISE_GUIDE_DETAIL_START_INDEX);
        setPendingEnterpriseStep(null);
      }, 15000);
      return () => {
        cancelled = true;
        globalThis.clearInterval(intervalId);
        globalThis.clearTimeout(cap);
      };
    }
  }, [location.pathname, pendingEnterpriseStep]);

  useEffect(() => {
    if (!open || pendingPath) return;
    if (!resolvedPath) {
      setOpen(false);
      setCurrent(0);
      setPendingPath(null);
      setPendingEnterpriseStep(null);
    }
  }, [location.pathname, open, pendingPath, resolvedPath]);

  /** 详情页 Tour 进入「逐标签」步骤时，同步切换 Tabs 便于对照内容 */
  useEffect(() => {
    if (!open || resolvedPath !== '/enterprise' || !isEnterpriseDetailPath(location.pathname)) return;
    const start = ENTERPRISE_GUIDE_TAB_STEPS_START_INDEX;
    const end = start + ENTERPRISE_GUIDE_DETAIL_TAB_KEYS.length - 1;
    if (current < start || current > end) return;
    const key = ENTERPRISE_GUIDE_DETAIL_TAB_KEYS[current - start];
    globalThis.dispatchEvent(new CustomEvent(ENTERPRISE_GUIDE_TAB_EVENT, { detail: { key } }));
  }, [open, resolvedPath, location.pathname, current]);

  const handleTourChange = (next: number) => {
    if (resolvedPath !== '/enterprise') {
      setCurrent(next);
      return;
    }

    if (current === 2 && next === ENTERPRISE_GUIDE_DETAIL_START_INDEX && location.pathname === '/enterprise') {
      const id = pickFirstEnterpriseIdFromListTable();
      if (!id) {
        message.warning('当前列表暂无企业，请先新增企业后再继续。');
        return;
      }
      setPendingEnterpriseStep(ENTERPRISE_GUIDE_DETAIL_START_INDEX);
      navigate(`/enterprise/${id}`);
      return;
    }

    if (
      current === ENTERPRISE_GUIDE_DETAIL_START_INDEX &&
      next === 2 &&
      isEnterpriseDetailPath(location.pathname)
    ) {
      setPendingEnterpriseStep(2);
      navigate('/enterprise');
      return;
    }

    setCurrent(next);
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minWidth: 0,
        }}
      >
        <div style={{ minWidth: 230 }}>
          <Select
            value={activePath}
            options={GUIDE_MODULE_OPTIONS}
            // 必须用 onSelect：与当前模块相同时 value 不变，onChange 不会触发，用户无法再次开始引导
            onSelect={(value) => startGuide(String(value))}
            optionFilterProp="label"
            popupMatchSelectWidth={false}
            placeholder="选择模块开始引导"
            suffixIcon={<QuestionCircleOutlined style={{ color: '#396AFF' }} />}
            size="large"
            style={{ width: '100%' }}
          />
        </div>
        {open && (
          <Button
            type="text"
            danger
            icon={<CloseCircleOutlined />}
            onClick={closeGuide}
            style={{ height: 40, borderRadius: 12 }}
          >
            结束指引
          </Button>
        )}
      </div>

      <Tour
        open={open}
        onClose={closeGuide}
        onFinish={closeGuide}
        steps={steps}
        current={current}
        onChange={handleTourChange}
        mask={{ color: 'rgba(20, 31, 56, 0.45)' }}
        scrollIntoViewOptions={{ behavior: 'smooth', block: 'center' }}
      />
    </>
  );
}

export default AppGuide;
