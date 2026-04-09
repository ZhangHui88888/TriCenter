import type {
  ProviderContactInfo,
  ProviderDetail,
  ProviderEditableContact,
  ProviderUpdatePayload,
} from '@/types';

export function normalizeProviderContacts(contacts?: ProviderContactInfo[]): ProviderEditableContact[] {
  return (contacts || []).map((contact) => ({
    id: contact.id,
    name: contact.name || '',
    phone: contact.phone || '',
    position: contact.position || '',
    isPrimary: contact.isPrimary === 1,
    email: contact.email || '',
    wechat: contact.wechat || '',
    remark: contact.remark || '',
  }));
}

export function buildProviderUpdatePayload(
  provider: ProviderDetail,
  overrides: Partial<ProviderUpdatePayload> = {}
): ProviderUpdatePayload {
  return {
    name: provider.name,
    category: provider.category || undefined,
    description: provider.description || undefined,
    creditCode: provider.creditCode || undefined,
    province: provider.province || undefined,
    city: provider.city || undefined,
    district: provider.district || undefined,
    address: provider.address || undefined,
    website: provider.website || undefined,
    serviceScope: provider.serviceScope || undefined,
    serviceTags: provider.serviceTags,
    staffSizeId: provider.staffSizeId ?? undefined,
    qualification: provider.qualification || undefined,
    capabilityRequirementIds: provider.capabilityRequirementIds || [],
    cooperationStartDate: provider.cooperationStartDate || null,
    cooperationStatus: provider.cooperationStatus || undefined,
    contractEndDate: provider.contractEndDate || null,
    ...overrides,
  };
}
