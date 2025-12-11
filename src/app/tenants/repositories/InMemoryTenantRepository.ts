/**
 * In-Memory Tenant Repository Implementation
 * Mock data store with simulated async operations
 */
import { ITenantRepository } from './ITenantRepository';
import { Tenant } from '../models/Tenant';
import { TenantInput } from '../dto/TenantTypes';
import { generateUUID } from '@/lib/uuid';

export class InMemoryTenantRepository implements ITenantRepository {
  private tenants: Map<string, Tenant>;

  constructor() {
    this.tenants = new Map();
    this.seedMockData();
  }

  /**
   * Seeds the repository with 5 pre-defined tenants
   */
  private seedMockData(): void {
    const now = new Date();
    const mockTenants: Tenant[] = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Acme Corporation',
        created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updated_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'TechStart Inc.',
        created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        updated_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Global Solutions Ltd',
        created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updated_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Innovation Labs',
        created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updated_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        name: 'Digital Ventures LLC',
        created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
    ];

    mockTenants.forEach((tenant) => {
      this.tenants.set(tenant.id, tenant);
    });
  }

  /**
   * Simulates network latency (100-300ms random delay)
   */
  private async simulateLatency(): Promise<void> {
    const delay = Math.floor(Math.random() * 200) + 100; // 100-300ms
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  async getTenants(): Promise<Tenant[]> {
    await this.simulateLatency();

    // Return tenants sorted by created_at descending (newest first)
    return Array.from(this.tenants.values()).sort(
      (a, b) => b.created_at.getTime() - a.created_at.getTime()
    );
  }

  async getTenantById(id: string): Promise<Tenant | null> {
    await this.simulateLatency();
    return this.tenants.get(id) ?? null;
  }

  async createTenant(input: TenantInput): Promise<Tenant> {
    await this.simulateLatency();

    const now = new Date();
    const newTenant: Tenant = {
      id: generateUUID(),
      name: input.name,
      created_at: now,
      updated_at: now,
    };

    this.tenants.set(newTenant.id, newTenant);
    return newTenant;
  }

  async updateTenant(id: string, input: TenantInput): Promise<Tenant> {
    await this.simulateLatency();

    const existingTenant = this.tenants.get(id);
    if (!existingTenant) {
      throw new Error(`Tenant with ID ${id} not found`);
    }

    const updatedTenant: Tenant = {
      ...existingTenant,
      name: input.name,
      updated_at: new Date(),
    };

    this.tenants.set(id, updatedTenant);
    return updatedTenant;
  }

  async deleteTenant(id: string): Promise<void> {
    await this.simulateLatency();

    if (!this.tenants.has(id)) {
      throw new Error(`Tenant with ID ${id} not found`);
    }

    this.tenants.delete(id);
  }
}
