# Implementation Plan: Accounting Module

## Overview

This plan implements a double-entry bookkeeping system for the NestJS backend following established project patterns. The implementation includes entities (Account, Transaction, TransactionLine), DTOs, services, controllers, and mappers with comprehensive validation and property-based testing.

## Tasks

- [x] 1. Set up module structure and enums
  - Create src/app/modules/accounting directory structure
  - Create dtos/ subdirectory
  - Add ACCOUNT to GeneratorTypes enum in src/core/enums/generator-types.ts
  - Update generator utility prefix map to support ACCOUNT type
  - _Requirements: 10.1, 10.2, 8.2_

- [ ] 2. Create Account entity and enums
  - [x] 2.1 Create AccountType enum and Account entity
    - Define AccountType enum (ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE)
    - Create Account entity extending BaseEntity with all required fields
    - Add TypeORM decorators for columns, relationships, and constraints
    - Implement self-referencing relationship for hierarchical structure
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 2.2 Write property test for Account entity persistence
    - **Property 1: Entity persistence round-trip**
    - **Validates: Requirements 1.1**

- [ ] 3. Create Transaction and TransactionLine entities
  - [x] 3.1 Create TransactionStatus enum and Transaction entity
    - Define TransactionStatus enum (DRAFT, POSTED, CANCELLED)
    - Create Transaction entity extending BaseEntity with all required fields
    - Add one-to-many relationship with TransactionLine
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.2 Create TransactionLine entity
    - Create TransactionLine entity extending BaseEntity
    - Add many-to-one relationships to Transaction and Account
    - Use decimal type (precision 12, scale 2) for debit and credit fields
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 3.3 Write property test for audit fields population
    - **Property 2: Audit fields population**
    - **Validates: Requirements 1.2, 2.2, 3.2**

  - [ ]* 3.4 Write property test for Transaction-Line relationship
    - **Property 6: Transaction-Line relationship**
    - **Validates: Requirements 2.5**

- [ ] 4. Create Account DTOs
  - [x] 4.1 Create AccountDTO, CreateAccountDTO, UpdateAccountDTO, QueryAccountDTO
    - Implement AccountDTO with all fields and Swagger decorators
    - Implement CreateAccountDTO omitting auto-generated fields
    - Implement UpdateAccountDTO as partial of CreateAccountDTO
    - Implement QueryAccountDTO extending PaginateDTO with filter fields
    - Add class-validator decorators for validation
    - _Requirements: 1.7, 12.1, 12.2, 12.3, 11.6, 11.7_

- [ ] 5. Create Transaction and TransactionLine DTOs
  - [x] 5.1 Create Transaction DTOs
    - Implement TransactionDTO with all fields and Swagger decorators
    - Implement CreateTransactionDTO with lines array
    - Implement UpdateTransactionDTO as partial
    - Implement QueryTransactionDTO extending PaginateDTO with filter fields
    - _Requirements: 2.6, 5.1, 7.5, 12.4, 12.5, 12.6, 12.7, 11.6, 11.7_

  - [x] 5.2 Create TransactionLine DTOs
    - Implement TransactionLineDTO with all fields
    - Implement CreateTransactionLineDTO omitting auto-generated fields
    - Implement UpdateTransactionLineDTO as partial
    - _Requirements: 3.5_

- [ ] 6. Create Account mapper
  - [x] 6.1 Implement Account mapper functions
    - Create mapAccountToAccountDtoSelective with overloads for single and array
    - Create mapCreateAccountDtoToEntity
    - Create mapUpdateAccountDtoToEntity
    - Follow pattern from journey.mapper.ts and supplier.mapper.ts
    - _Requirements: 1.8_

  - [ ]* 6.2 Write property test for mapper round-trip preservation
    - **Property 5: Mapper round-trip preservation**
    - **Validates: Requirements 1.8, 2.7, 3.6**

- [ ] 7. Create Transaction and TransactionLine mappers
  - [x] 7.1 Implement Transaction mapper functions
    - Create mapTransactionToTransactionDtoSelective with overloads
    - Create mapCreateTransactionDtoToEntity
    - Create mapUpdateTransactionDtoToEntity
    - _Requirements: 2.7_

  - [x] 7.2 Implement TransactionLine mapper functions
    - Create mapTransactionLineToTransactionLineDtoSelective with overloads
    - Create mapCreateTransactionLineDtoToEntity
    - Create mapUpdateTransactionLineDtoToEntity
    - _Requirements: 3.6_

- [ ] 8. Implement AccountService with code generation
  - [x] 8.1 Create AccountService with CRUD methods
    - Implement findById, findByFields, find, findAndCount methods
    - Implement save method with unique code generation using generateUniqueCode
    - Implement update and delete methods
    - Apply query filters for type and isActive in findAndCount
    - _Requirements: 1.9, 8.1, 8.2, 12.8_

  - [ ]* 8.2 Write property test for account code uniqueness
    - **Property 3: Account code uniqueness**
    - **Validates: Requirements 1.4**

  - [ ]* 8.3 Write property test for unique account code generation
    - **Property 17: Unique account code generation**
    - **Validates: Requirements 8.1**

  - [ ]* 8.4 Write property test for hierarchical code generation
    - **Property 18: Hierarchical code generation**
    - **Validates: Requirements 8.4**

  - [ ]* 8.5 Write property test for account query filtering
    - **Property 16: Account query filtering**
    - **Validates: Requirements 12.2, 12.3**

- [ ] 9. Implement TransactionService with validation
  - [x] 9.1 Create TransactionService with CRUD methods
    - Implement findById, findByFields, find, findAndCount methods
    - Implement save method with unique reference number generation
    - Implement update and delete methods
    - Apply query filters for status, date range, referenceType, referenceId
    - _Requirements: 2.8, 9.2, 9.4, 12.9_

  - [x] 9.2 Implement double-entry bookkeeping validation
    - Add validateTransaction private method
    - Validate minimum two transaction lines
    - Validate exclusive debit or credit (only one can be non-zero)
    - Validate required debit or credit (at least one must be non-zero)
    - Validate balanced transaction when status is POSTED
    - Prevent modification of POSTED or CANCELLED transactions
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ]* 9.3 Write property test for minimum transaction lines
    - **Property 7: Minimum transaction lines**
    - **Validates: Requirements 4.1**

  - [ ]* 9.4 Write property test for exclusive debit or credit
    - **Property 8: Exclusive debit or credit**
    - **Validates: Requirements 4.2**

  - [ ]* 9.5 Write property test for required debit or credit
    - **Property 9: Required debit or credit**
    - **Validates: Requirements 4.3**

  - [ ]* 9.6 Write property test for balanced transaction on posting
    - **Property 10: Balanced transaction on posting**
    - **Validates: Requirements 4.4**

  - [ ]* 9.7 Write property test for posted transaction immutability
    - **Property 11: Posted transaction immutability**
    - **Validates: Requirements 4.6, 4.7**

  - [ ]* 9.8 Write property test for unique transaction reference number
    - **Property 19: Unique transaction reference number**
    - **Validates: Requirements 9.1**

  - [ ]* 9.9 Write property test for transaction reference number immutability
    - **Property 20: Transaction reference number immutability**
    - **Validates: Requirements 9.3**

  - [ ]* 9.10 Write property test for transaction reference number format
    - **Property 21: Transaction reference number format**
    - **Validates: Requirements 9.4**

  - [ ]* 9.11 Write property test for transaction query filtering
    - **Property 15: Transaction query filtering**
    - **Validates: Requirements 7.5, 12.5, 12.6, 12.7**

- [ ] 10. Implement TransactionLineService
  - [x] 10.1 Create TransactionLineService with CRUD methods
    - Implement findById, findByFields, find, findAndCount methods
    - Implement save, update, and delete methods
    - Include relations for account and transaction in findById
    - _Requirements: 3.7_

- [ ] 11. Implement AccountController with REST endpoints
  - [ ] 11.1 Create AccountController with authentication and authorization
    - Add controller decorators (@Controller, @ApiBearerAuth, @UseGuards, @Roles, @ApiTags)
    - Implement GET / endpoint with pagination
    - Implement GET /:id endpoint
    - Implement POST / endpoint with parent account validation
    - Implement PUT /:id endpoint with parent account validation
    - Implement DELETE /:id endpoint
    - Use mappers to transform between entities and DTOs
    - _Requirements: 1.10, 1.11, 1.12, 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ]* 11.2 Write unit tests for AccountController endpoints
    - Test GET / with pagination
    - Test GET /:id with valid and invalid IDs
    - Test POST / with valid and invalid data
    - Test PUT /:id with valid and invalid data
    - Test DELETE /:id

- [ ] 12. Implement TransactionController with atomic operations
  - [ ] 12.1 Create TransactionController with authentication and authorization
    - Add controller decorators (@Controller, @ApiBearerAuth, @UseGuards, @Roles, @ApiTags)
    - Implement GET / endpoint with pagination
    - Implement GET /:id endpoint
    - Implement GET /:id/reference endpoint for linked entities
    - Inject DataSource for transaction management
    - _Requirements: 2.9, 2.10, 7.4, 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ] 12.2 Implement POST / endpoint with atomic transaction creation
    - Implement validateAccountReferences private method
    - Validate all account references exist and are active
    - Use withTransaction utility for atomic operation
    - Create Transaction and all TransactionLine entities in single database transaction
    - Return complete transaction with all lines populated
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 12.3 Implement PUT /:id and DELETE /:id endpoints
    - Implement PUT /:id endpoint
    - Implement DELETE /:id endpoint
    - Use mappers to transform between entities and DTOs
    - _Requirements: 2.9, 2.10_

  - [ ]* 12.4 Write property test for atomic transaction creation
    - **Property 12: Atomic transaction creation**
    - **Validates: Requirements 5.2, 5.4**

  - [ ]* 12.5 Write property test for complete transaction response
    - **Property 13: Complete transaction response**
    - **Validates: Requirements 5.5**

  - [ ]* 12.6 Write property test for valid account reference
    - **Property 14: Valid account reference**
    - **Validates: Requirements 6.1, 6.3**

  - [ ]* 12.7 Write unit tests for TransactionController endpoints
    - Test GET / with pagination and filters
    - Test GET /:id with valid and invalid IDs
    - Test POST / with valid and invalid data
    - Test PUT /:id with valid and invalid data
    - Test DELETE /:id
    - Test GET /:id/reference

- [ ] 13. Create AccountingModule and integrate with AppModule
  - [ ] 13.1 Create AccountingModule
    - Create accounting.module.ts with @Module decorator
    - Import TypeOrmModule.forFeature with Account, Transaction, TransactionLine
    - Declare and export all services and controllers
    - _Requirements: 10.3, 10.4, 10.5_

  - [ ] 13.2 Integrate AccountingModule into AppModule
    - Import AccountingModule in src/app/app.module.ts
    - _Requirements: 10.6_

- [ ] 14. Checkpoint - Ensure all tests pass
  - Run all unit tests and property-based tests
  - Verify all endpoints are accessible
  - Ensure all tests pass, ask the user if questions arise

- [ ]* 15. Write property test for hierarchical account relationship
  - **Property 4: Hierarchical account relationship**
  - **Validates: Requirements 1.6**

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across randomized inputs
- Unit tests validate specific examples and edge cases
- The checkpoint ensures incremental validation before completion
- All code follows existing patterns from journey, supplier, and expense modules
- Double-entry bookkeeping validation is critical for data integrity
- Atomic operations ensure consistency when creating transactions with lines
