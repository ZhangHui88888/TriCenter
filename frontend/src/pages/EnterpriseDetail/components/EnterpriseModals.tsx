// @ts-nocheck
import StageChangeModal from '../modals/StageChangeModal';
import FollowUpModal from '../modals/FollowUpModal';
import PatentModal from '../modals/PatentModal';
import BrandModal from '../modals/BrandModal';
import PolicySupportModal from '../modals/PolicySupportModal';
import CompetitionModal from '../modals/CompetitionModal';
import RiskModal from '../modals/RiskModal';
import SupplementModal from '../modals/SupplementModal';
import TriCenterCoopModal from '../modals/TriCenterCoopModal';
import CrossborderPainModal from '../modals/CrossborderPainModal';
import EvaluationModal from '../modals/EvaluationModal';
import PreliminaryModal from '../modals/PreliminaryModal';
import CrossborderPlatformModal from '../modals/CrossborderPlatformModal';
import MarketModal from '../modals/MarketModal';
import CrossborderNeedsModal from '../modals/CrossborderNeedsModal';
import TradeModal from '../modals/TradeModal';
import ReasonModal from '../modals/ReasonModal';
import ProductModal from '../modals/ProductModal';
import CrossborderBasicModal from '../modals/CrossborderBasicModal';
import TradePerformanceModal from '../modals/TradePerformanceModal';
import EditEnterpriseModal from '../modals/EditEnterpriseModal';
import EditContactModal from '../modals/EditContactModal';
import ProductOverviewModal from '../modals/ProductOverviewModal';
import TradeChangeModal from '../modals/TradeChangeModal';

import type { useEnterpriseData } from '../hooks/useEnterpriseData';
import type { useEnterpriseActions } from '../hooks/useEnterpriseActions';

type D = ReturnType<typeof useEnterpriseData>;
type A = ReturnType<typeof useEnterpriseActions>;

interface Props { d: D; actions: A; }

export default function EnterpriseModals({ d, actions }: Props) {
  const ent = d.enterprise;
  return (
    <>
      <StageChangeModal
        open={d.isStageModalOpen}
        selectedStage={d.selectedStage}
        onStageChange={d.setSelectedStage}
        onOk={actions.handleStageChange}
        onClose={() => d.setIsStageModalOpen(false)}
      />

      <FollowUpModal
        open={d.isFollowUpModalOpen}
        enterpriseId={ent.id}
        editingRecord={d.editingFollowUp}
        onClose={() => { d.setIsFollowUpModalOpen(false); d.setEditingFollowUp(null); }}
        onSuccess={async (stageChanged) => {
          if (stageChanged) {
            d.setEnterprise((prev) =>
              prev
                ? { ...prev, funnel_stage: stageChanged.stage, stage_name: stageChanged.stageName, stage_color: stageChanged.stageColor }
                : prev
            );
          }
          await d.loadEnterpriseFollowUps(ent.id);
        }}
      />

      <EditEnterpriseModal
        open={d.isEditEnterpriseOpen}
        enterprise={ent}
        industryCategories={d.industryCategories}
        staffSizeOptions={d.staffSizeOptions}
        sourceOptions={d.sourceOptions}
        sourceProviderOptions={d.sourceProviderOptions}
        onClose={() => d.setIsEditEnterpriseOpen(false)}
        onSuccess={(updated) => d.setEnterprise((prev) => prev ? { ...prev, ...updated } : prev)}
      />

      <EditContactModal
        open={d.isEditContactOpen}
        enterpriseId={ent.id}
        initialContacts={ent.contacts || []}
        onClose={() => d.setIsEditContactOpen(false)}
        onSuccess={(contacts) => d.setEnterprise((prev) => prev ? { ...prev, contacts } : prev)}
      />

      <ProductModal
        open={d.isProductModalOpen}
        enterpriseId={ent.id}
        editingRecord={d.editingProduct}
        productCategoryTree={d.productCategoryTree}
        productCascaderOptions={d.productCascaderOptions}
        certificationOptions={d.certificationOptions}
        regionOptions={d.regionOptions}
        automationLevelOptions={d.automationLevelOptionsProduct}
        logisticsOptions={d.logisticsOptionsProduct}
        onClose={() => { d.setIsProductModalOpen(false); d.setEditingProduct(null); }}
        onSuccess={(products, regionNames, countryNames) =>
          d.setEnterprise((prev) =>
            prev
              ? {
                  ...prev,
                  products,
                  overviewMergedTargetRegionNames: regionNames,
                  overviewMergedTargetCountryNames: countryNames,
                }
              : prev
          )
        }
      />

      <BrandModal
        open={d.isBrandModalOpen}
        enterpriseId={ent.id}
        initialHasOwnBrand={!!(ent.has_own_brand === true || ent.has_own_brand === 1)}
        initialBrandNames={Array.isArray(ent.brand_names) ? ent.brand_names : (ent.brand_names ? String(ent.brand_names).split(',').filter(Boolean) : [])}
        onClose={() => d.setIsBrandModalOpen(false)}
        onSuccess={(hasOwnBrand, brandNames) =>
          d.setEnterprise((prev) => prev ? { ...prev, has_own_brand: hasOwnBrand, brand_names: brandNames } : prev)
        }
      />

      <PatentModal
        open={d.isPatentModalOpen}
        enterpriseId={ent.id}
        editingRecord={d.editingPatent}
        onClose={() => { d.setIsPatentModalOpen(false); d.setEditingPatent(null); }}
        onSuccess={(patents) => d.setEnterprise((prev) => prev ? { ...prev, patents } : prev)}
      />

      <ProductOverviewModal
        open={d.isProductOverviewModalOpen}
        enterpriseId={ent.id}
        enterprise={ent}
        regionOptions={d.regionOptions}
        onClose={() => d.setIsProductOverviewModalOpen(false)}
        onSuccess={(data) => {
          d.setEnterprise((prev) => {
            if (!prev) return prev;
            const next = { ...prev, ...data };
            next.target_region_ids = data.targetRegionIds;
            next.target_country_ids = data.targetCountryIds;
            next.has_import_export_license = data.hasImportExportLicense === 1;
            delete (next as any).overviewMergedTargetRegionNames;
            delete (next as any).overviewMergedTargetCountryNames;
            return next;
          });
        }}
      />

      <TradeModal
        open={d.isTradeModalOpen}
        enterpriseId={ent.id}
        initialData={{
          tradeModeId: ent.trade_mode_id ?? null,
          customsDeclarationMode: ent.customs_declaration_mode || '',
          tradeTeamModeId: ent.trade_team_mode_id ?? null,
          tradeTeamSize: ent.trade_team_size ?? null,
          hasDomesticEcommerce: ent.has_domestic_ecommerce === 1,
          hasOverseasDistributors: !!ent.has_overseas_distributors,
        }}
        tradeModeOptions={d.tradeModeOptions}
        tradeTeamModeOptions={d.tradeTeamModeOptions}
        marketChanges={d.marketChanges}
        modeChanges={d.modeChanges}
        categoryChanges={d.categoryChanges}
        growthReasons={d.growthReasons}
        declineReasons={d.declineReasons}
        onClose={() => d.setIsTradeModalOpen(false)}
        onSuccess={(data) =>
          d.setEnterprise((prev) => {
            if (!prev) return prev;
            const tradeLabel = d.tradeModeOptions.find(o => o.value === data.tradeModeId)?.label || prev.trade_mode;
            const teamLabel = d.tradeTeamModeOptions.find(o => o.value === data.tradeTeamModeId)?.label || prev.trade_team_mode;
            return {
              ...prev,
              trade_mode_id: data.tradeModeId,
              trade_mode: tradeLabel,
              customs_declaration_mode: data.customsDeclarationMode,
              trade_team_mode_id: data.tradeTeamModeId,
              trade_team_mode: teamLabel,
              trade_team_size: data.tradeTeamSize,
              has_domestic_ecommerce: data.hasDomesticEcommerce,
              has_overseas_distributors: data.hasOverseasDistributors === 1,
            };
          })
        }
      />

      <ReasonModal
        open={d.isReasonModalOpen}
        enterpriseId={ent.id}
        reasonType={d.reasonType}
        editingReason={d.editingReason}
        growthReasons={d.growthReasons}
        declineReasons={d.declineReasons}
        growthReasonSuggest={d.growthReasonSuggest}
        declineReasonSuggest={d.declineReasonSuggest}
        onLoadOptions={d.loadTradeReasonOptions}
        onClose={() => d.setIsReasonModalOpen(false)}
        onSuccess={(nextGrowth, nextDecline) => {
          d.setGrowthReasons(nextGrowth);
          d.setDeclineReasons(nextDecline);
          d.setEnterprise((prev) =>
            prev ? { ...prev, growth_reasons: nextGrowth, decline_reasons: nextDecline } : prev
          );
        }}
      />

      <TradeChangeModal
        open={d.isTradeChangeModalOpen}
        enterpriseId={ent.id}
        changeType={d.tradeChangeType}
        changeDirection={d.tradeChangeDirection}
        editingItem={d.editingTradeChange}
        marketChanges={d.marketChanges}
        modeChanges={d.modeChanges}
        categoryChanges={d.categoryChanges}
        onClose={() => d.setIsTradeChangeModalOpen(false)}
        onSuccess={(nextM, nextMo, nextC) => {
          d.setMarketChanges(nextM);
          d.setModeChanges(nextMo);
          d.setCategoryChanges(nextC);
        }}
      />

      <TradePerformanceModal
        open={d.isTradePerformanceModalOpen}
        enterpriseId={ent.id}
        initialData={{
          yearBeforeLastRevenue: ent.year_before_last_revenue ?? undefined,
          lastYearRevenue: ent.last_year_revenue ?? undefined,
        }}
        onClose={() => d.setIsTradePerformanceModalOpen(false)}
        onSuccess={(data) => {
          d.setEnterprise((prev) =>
            prev
              ? {
                  ...prev,
                  last_year_revenue: data.lastYearRevenue,
                  year_before_last_revenue: data.yearBeforeLastRevenue,
                }
              : prev
          );
        }}
      />

      <CrossborderPlatformModal
        open={d.isCrossborderPlatformModalOpen}
        enterpriseId={ent.id}
        selectedPlatforms={d.selectedCrossborderPlatforms}
        onPlatformsChange={d.setSelectedCrossborderPlatforms}
        onClose={() => d.setIsCrossborderPlatformModalOpen(false)}
        onSuccess={(platforms) =>
          d.setEnterprise((prev) => prev ? { ...prev, cross_border_platforms: platforms } : prev)
        }
      />

      <CrossborderBasicModal
        open={d.isCrossborderBasicModalOpen}
        enterpriseId={ent.id}
        initialData={{
          hasCrossBorder: ent.has_cross_border === 1 || ent.has_cross_border === true,
          crossBorderRatio: ent.cross_border_ratio ?? '',
          crossBorderLogistics: ent.cross_border_logistics ?? '',
          paymentSettlement: ent.payment_settlement ?? '',
          crossBorderTeamSize: ent.cross_border_team_size ?? null,
          usingErp: ent.using_erp === 1 || ent.using_erp === true,
          transformationWillingness: ent.transformation_willingness ?? '',
          investmentWillingness: ent.investment_willingness ?? '',
        }}
        onClose={() => d.setIsCrossborderBasicModalOpen(false)}
        onSuccess={(data) => {
          d.setEnterprise((prev) =>
            prev
              ? {
                  ...prev,
                  has_cross_border: data.hasCrossBorder ? 1 : 0,
                  cross_border_ratio: data.crossBorderRatio,
                  cross_border_logistics: data.crossBorderLogistics,
                  payment_settlement: data.paymentSettlement,
                  cross_border_team_size: data.crossBorderTeamSize,
                  using_erp: data.usingErp,
                  transformation_willingness: data.transformationWillingness,
                  investment_willingness: data.investmentWillingness,
                }
              : prev
          );
        }}
      />

      <MarketModal
        open={d.isMarketModalOpen}
        enterpriseId={ent.id}
        targetMarkets={d.targetMarkets}
        onMarketsChange={d.setTargetMarkets}
        onClose={() => d.setIsMarketModalOpen(false)}
        onSuccess={(markets) =>
          d.setEnterprise((prev) => prev ? { ...prev, target_markets: markets } : prev)
        }
      />

      <CrossborderNeedsModal
        open={d.isCrossborderNeedsModalOpen}
        enterpriseId={ent.id}
        tricenterDemands={ent.tricenter_demands || []}
        onClose={() => d.setIsCrossborderNeedsModalOpen(false)}
        onSuccess={(demands) =>
          d.setEnterprise((prev) => prev ? { ...prev, tricenter_demands: demands } : prev)
        }
      />

      <TriCenterCoopModal
        open={d.isTriCenterCoopModalOpen}
        enterpriseId={ent.id}
        tricenterDemands={ent.tricenter_demands || []}
        tricenterConcerns={ent.tricenter_concerns || ''}
        onClose={() => d.setIsTriCenterCoopModalOpen(false)}
        onSuccess={(demands, concerns) =>
          d.setEnterprise((prev) =>
            prev ? { ...prev, tricenter_demands: demands, tricenter_concerns: concerns } : prev
          )
        }
      />

      <CrossborderPainModal
        open={d.isCrossborderPainModalOpen}
        enterpriseId={ent.id}
        painPoints={ent.pain_points || []}
        onClose={() => d.setIsCrossborderPainModalOpen(false)}
        onSuccess={(painPoints) =>
          d.setEnterprise((prev) => prev ? { ...prev, pain_points: painPoints } : prev)
        }
      />

      <EvaluationModal
        open={d.isEvaluationModalOpen}
        enterpriseId={ent.id}
        initialData={{
          serviceCooperationRating: ent.service_cooperation_rating,
          investmentCooperationRating: ent.investment_cooperation_rating,
          incubationCooperationRating: ent.incubation_cooperation_rating,
          brandCooperationRating: ent.brand_cooperation_rating,
          trainingCooperationRating: ent.training_cooperation_rating,
          overallCooperationRating: ent.overall_cooperation_rating,
        }}
        onClose={() => d.setIsEvaluationModalOpen(false)}
        onSuccess={(data) =>
          d.setEnterprise((prev) =>
            prev
              ? {
                  ...prev,
                  service_cooperation_rating: data.serviceCooperationRating,
                  investment_cooperation_rating: data.investmentCooperationRating,
                  incubation_cooperation_rating: data.incubationCooperationRating,
                  brand_cooperation_rating: data.brandCooperationRating,
                  training_cooperation_rating: data.trainingCooperationRating,
                  overall_cooperation_rating: data.overallCooperationRating,
                }
              : prev
          )
        }
      />

      <PreliminaryModal
        open={d.isPreliminaryModalOpen}
        enterpriseId={ent.id}
        transformationWillingness={ent.transformation_willingness || ''}
        investmentWillingness={ent.investment_willingness || ''}
        benchmarkPossibility={ent.benchmark_possibility ?? null}
        onClose={() => d.setIsPreliminaryModalOpen(false)}
        onSuccess={(data) =>
          d.setEnterprise((prev) =>
            prev
              ? {
                  ...prev,
                  transformation_willingness: data.transformationWillingness,
                  investment_willingness: data.investmentWillingness,
                  benchmark_possibility: data.benchmarkPossibility,
                }
              : prev
          )
        }
      />

      <SupplementModal
        open={d.isSupplementModalOpen}
        enterpriseId={ent.id}
        additionalNotes={ent.additional_notes || ''}
        onClose={() => d.setIsSupplementModalOpen(false)}
        onSuccess={(additionalNotes) =>
          d.setEnterprise((prev) => prev ? { ...prev, additional_notes: additionalNotes } : prev)
        }
      />

      <PolicySupportModal
        open={d.isPolicySupportModalOpen}
        enterpriseId={ent.id}
        hasPolicySupport={ent.has_policy_support === 1 || ent.has_policy_support === true}
        enjoyedPolicies={ent.enjoyed_policies || []}
        onClose={() => d.setIsPolicySupportModalOpen(false)}
        onSuccess={(hasPolicySupport, enjoyedPolicies) =>
          d.setEnterprise((prev) => prev ? { ...prev, has_policy_support: hasPolicySupport, enjoyed_policies: enjoyedPolicies } : prev)
        }
      />

      <CompetitionModal
        open={d.isCompetitionModalOpen}
        enterpriseId={ent.id}
        competitionPosition={ent.competition_position || ''}
        competitionDescription={ent.competition_description || ''}
        onClose={() => d.setIsCompetitionModalOpen(false)}
        onSuccess={(position, description) => {
          d.setEnterprise((prev) =>
            prev ? { ...prev, competition_position: position, competition_description: description } : prev
          );
          d.setCompetitionPosition(position);
          d.setCompetitionDesc(description);
        }}
      />

      <RiskModal
        open={d.isRiskModalOpen}
        enterpriseId={ent.id}
        currentRiskTags={Array.isArray(ent.current_risk_tags) ? ent.current_risk_tags : []}
        riskDescription={ent.risk_description || ''}
        onClose={() => d.setIsRiskModalOpen(false)}
        onSuccess={(riskTags, riskDescription) =>
          d.setEnterprise((prev) =>
            prev ? { ...prev, current_risk_tags: riskTags, risk_description: riskDescription } : prev
          )
        }
      />
    </>
  );
}
