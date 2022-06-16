import { ResourceRequestFilters } from "../../../shared/models/resource-request-filters";
import { ResourceRequestDbModel } from "../../../db/models/resource-request.db.model";

export const getRequestsBasedOnFilters = (filters: ResourceRequestFilters) => {
  let resourceRequestFilters: ResourceRequestFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => !!value)
  );
  // Apply title filter regex only when the filters have a valid title in the request
  if (resourceRequestFilters?.title) {
    resourceRequestFilters = {
      ...resourceRequestFilters,
      title: { $regex: filters?.title, $options: "i" } as any,
    };
  }
  return ResourceRequestDbModel.find(resourceRequestFilters);
};
