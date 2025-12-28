/**
 * Repository Registry: Factory for obtaining repository instances
 * Centralizes repository instantiation logic
 */
import { IExamRepository } from './IExamRepository';
import { InMemoryExamRepository } from './InMemoryExamRepository';
import { YamlExamRepository } from './YamlExamRepository';

export type RepositoryType = 'memory' | 'yaml' | 'api';

export class ExamRepositoryRegistry {
  /**
   * Factory method to get repository instance by type
   * @param type - Repository type ('memory' for in-memory, 'yaml' for YAML files, 'api' for API-based)
   * @returns IExamRepository instance
   */
  static getRepository(type: RepositoryType = 'yaml'): IExamRepository {
    switch (type) {
      case 'memory':
        return new InMemoryExamRepository();
      case 'yaml':
        return new YamlExamRepository();
      case 'api':
        // TODO: Implement API-based repository when backend is ready
        throw new Error('API repository not yet implemented');
      default:
        throw new Error(`Unknown repository type: ${type}`);
    }
  }
}
