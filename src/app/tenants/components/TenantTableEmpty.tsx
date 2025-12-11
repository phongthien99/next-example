/**
 * Empty State Component for Tenant Table
 * Displayed when no tenants exist
 */
export function TenantTableEmpty() {
  return (
    <div className="rounded-md border">
      <div className="flex flex-col items-center justify-center p-12">
        <div className="text-center">
          <h3 className="text-lg font-semibold">No Tenants Found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started by creating your first tenant.
          </p>
        </div>
      </div>
    </div>
  );
}
