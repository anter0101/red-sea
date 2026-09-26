# Requirements Document

## Introduction

This document defines the requirements for an accounting module to be integrated into an existing NestJS backend project. The module implements double-entry bookkeeping principles with a chart of accounts, transactions, and transaction lines. The implementation must follow the existing project patterns for entities, DTOs, services, controllers, and mappers as established in modules like journey, expense, supplier, and client.

## Glossary

- **Accounting_Module**: The complete accounting system including accounts, transactions, and transaction lines
- **Account**: A ledger account in the chart of accounts with a unique code, name, and type
- **Transaction**: A financial transaction containing multiple transaction lines that must balance
- **Transaction_Line**: An individual debit or credit entry within a transaction
- **Chart_of_Accounts**: The hierarchical structure of all accounts in the system
- **Double_Entry_Bookkeeping**: Accounting principle where every transaction has equal debits and credits
- **Account_Type**: Classification of accounts (ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE)
- **Transaction_Status**: State of a transaction (DRAFT, POSTED, CANCELLED)
- **Debit**: Left-side entry in double-entry bookkeeping (increases assets/expenses, decreases liabilities/equity/revenue)
- **Credit**: Right-side entry in double-entry bookkeeping (increases liabilities/equity/revenue, decreases assets/expenses)
- **BaseEntity**: The project's base entity class providing audit fields (id, createdBy, createdAt, updatedBy, updatedAt, deletedBy, deletedAt)
- **TypeORM**: The ORM framework used for database entities and relationships
- **DTO**: Data Transfer Object used for API request/response validation
- **Mapper**: Utility function that transforms between entities and DTOs

## Requirements

### Requirement 1: Account Entity Management

**User Story:** As a system administrator, I want to manage a chart of accounts, so that I can organize financial transactions by account type and hierarchy.

#### Acceptance Criteria

1. THE Accounting_Module SHALL store Account entities with the following fields: id (from BaseEntity), code (unique string), name (string), type (AccountType enum), parentAccountId (optional number), currency (string), isActive (boolean), ownerType (optional enum), ownerId (optional number)
2. THE Account entity SHALL extend BaseEntity to inherit audit fields (createdBy, createdAt, updatedBy, updatedAt, deletedBy, deletedAt)
3. THE Account entity SHALL use TypeORM decorators (@Entity, @Column, @ManyToOne) following the pattern established in journey.entity.ts and supplier.entity.ts
4. THE Account entity SHALL enforce unique constraint on the code field
5. THE Account entity SHALL define AccountType enum with values: ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
6. WHEN an Account has a parentAccountId, THE Accounting_Module SHALL establish a self-referencing relationship to support hierarchical account structures
7. THE Accounting_Module SHALL provide Account DTOs (AccountDTO, CreateAccountDTO, UpdateAccountDTO, QueryAccountDTO) following the pattern in journey/dtos and supplier/dtos
8. THE Accounting_Module SHALL provide an AccountMapper with functions to transform between Account entities and DTOs following the pattern in journey.mapper.ts and supplier.mapper.ts
9. THE Accounting_Module SHALL provide an AccountService with methods: findById, findByFields, find, findAndCount, save, update, delete following the pattern in journey.service.ts and supplier.service.ts
10. THE Accounting_Module SHALL provide an AccountController with REST endpoints (GET /, GET /:id, POST /, PUT /:id, DELETE /:id) following the pattern in journey.controller.ts
11. THE AccountController SHALL use AuthGuard, RolesGuard, and @ApiBearerAuth decorators for authentication and authorization
12. THE AccountController SHALL use pagination with PageRequest and HeaderUtil.addPaginationHeaders following the journey.controller.ts pattern

### Requirement 2: Transaction Entity Management

**User Story:** As an accountant, I want to create and manage financial transactions, so that I can record business activities in the accounting system.

#### Acceptance Criteria

1. THE Accounting_Module SHALL store Transaction entities with the following fields: id (from BaseEntity), referenceNumber (unique string), date (date), description (string), status (TransactionStatus enum), referenceType (optional string), referenceId (optional number)
2. THE Transaction entity SHALL extend BaseEntity to inherit audit fields
3. THE Transaction entity SHALL use TypeORM decorators following existing entity patterns
4. THE Transaction entity SHALL define TransactionStatus enum with values: DRAFT, POSTED, CANCELLED
5. THE Transaction entity SHALL have a one-to-many relationship with TransactionLine entities
6. THE Accounting_Module SHALL provide Transaction DTOs (TransactionDTO, CreateTransactionDTO, UpdateTransactionDTO, QueryTransactionDTO) following existing DTO patterns
7. THE Accounting_Module SHALL provide a TransactionMapper following existing mapper patterns
8. THE Accounting_Module SHALL provide a TransactionService with standard CRUD methods following existing service patterns
9. THE Accounting_Module SHALL provide a TransactionController with REST endpoints following existing controller patterns
10. THE TransactionController SHALL use authentication, authorization, and pagination following existing patterns

### Requirement 3: Transaction Line Entity Management

**User Story:** As an accountant, I want to record individual debit and credit entries within transactions, so that I can implement double-entry bookkeeping.

#### Acceptance Criteria

1. THE Accounting_Module SHALL store TransactionLine entities with the following fields: id (from BaseEntity), transactionId (number), accountId (number), debit (decimal), credit (decimal), description (optional string)
2. THE TransactionLine entity SHALL extend BaseEntity to inherit audit fields
3. THE TransactionLine entity SHALL use TypeORM decorators with @ManyToOne relationships to Transaction and Account entities
4. THE TransactionLine entity SHALL use decimal type with precision 12 and scale 2 for debit and credit fields following the expense.entity.ts pattern
5. THE Accounting_Module SHALL provide TransactionLine DTOs following existing DTO patterns
6. THE Accounting_Module SHALL provide a TransactionLineMapper following existing mapper patterns
7. THE Accounting_Module SHALL provide a TransactionLineService with standard CRUD methods following existing service patterns
8. WHERE TransactionLine management is exposed via API, THE Accounting_Module SHALL provide a TransactionLineController following existing controller patterns

### Requirement 4: Double-Entry Bookkeeping Validation

**User Story:** As an accountant, I want the system to enforce double-entry bookkeeping rules, so that all transactions remain balanced and accurate.

#### Acceptance Criteria

1. WHEN creating or updating a Transaction, THE Accounting_Module SHALL validate that the transaction contains at least two TransactionLine entries
2. WHEN creating or updating a TransactionLine, THE Accounting_Module SHALL validate that only one of debit or credit is non-zero (both cannot have values simultaneously)
3. WHEN creating or updating a TransactionLine, THE Accounting_Module SHALL validate that at least one of debit or credit is non-zero (both cannot be zero simultaneously)
4. WHEN posting a Transaction (changing status from DRAFT to POSTED), THE Accounting_Module SHALL validate that the sum of all debit amounts equals the sum of all credit amounts across all TransactionLine entries
5. IF the sum of debits does not equal the sum of credits, THEN THE Accounting_Module SHALL return a validation error with message "Transaction is not balanced: debits must equal credits"
6. WHEN a Transaction status is POSTED, THE Accounting_Module SHALL prevent modifications to the Transaction and its TransactionLine entries
7. WHEN a Transaction status is CANCELLED, THE Accounting_Module SHALL prevent modifications to the Transaction and its TransactionLine entries

### Requirement 5: Transaction Creation with Lines

**User Story:** As an accountant, I want to create a complete transaction with all its lines in a single operation, so that I can efficiently record financial activities.

#### Acceptance Criteria

1. THE CreateTransactionDTO SHALL include a lines array property containing CreateTransactionLineDTO objects
2. WHEN creating a Transaction via POST /api/transactions, THE Accounting_Module SHALL create the Transaction entity and all associated TransactionLine entities within a single database transaction
3. THE Accounting_Module SHALL use the withTransaction utility function (as seen in journey.controller.ts) to ensure atomicity
4. IF any validation fails during transaction creation, THEN THE Accounting_Module SHALL roll back all changes and return an appropriate error response
5. WHEN a Transaction is successfully created, THE Accounting_Module SHALL return the complete Transaction with all TransactionLine entries populated

### Requirement 6: Account Reference Validation

**User Story:** As a system administrator, I want the system to validate account references, so that transaction lines only reference valid, active accounts.

#### Acceptance Criteria

1. WHEN creating or updating a TransactionLine, THE Accounting_Module SHALL validate that the referenced accountId exists in the Account table
2. IF the referenced accountId does not exist, THEN THE Accounting_Module SHALL return a NotFoundException with message "Account with id {accountId} not found"
3. WHEN creating or updating a TransactionLine, THE Accounting_Module SHALL validate that the referenced Account has isActive set to true
4. IF the referenced Account is not active, THEN THE Accounting_Module SHALL return a validation error with message "Account {code} is not active"
5. THE Accounting_Module SHALL follow the validation pattern established in journey.controller.ts validateJourneyReferences method

### Requirement 7: Transaction Reference Linking

**User Story:** As a developer, I want to link transactions to other business entities, so that I can trace financial entries back to their source documents.

#### Acceptance Criteria

1. THE Transaction entity SHALL provide optional referenceType and referenceId fields to link to other entities
2. WHERE a Transaction is created from a Journey, THE Accounting_Module SHALL set referenceType to "JOURNEY" and referenceId to the journey's id
3. WHERE a Transaction is created from an Expense, THE Accounting_Module SHALL set referenceType to "EXPENSE" and referenceId to the expense's id
4. THE TransactionController SHALL provide a GET /api/transactions/:id/reference endpoint that returns the linked entity details
5. WHEN querying transactions, THE QueryTransactionDTO SHALL support filtering by referenceType and referenceId

### Requirement 8: Account Code Generation

**User Story:** As a system administrator, I want account codes to be automatically generated, so that I can maintain consistent account numbering.

#### Acceptance Criteria

1. WHEN creating a new Account without a code, THE Accounting_Module SHALL generate a unique account code using the generateUniqueCode utility function
2. THE Accounting_Module SHALL use GeneratorTypes.ACCOUNT as the generator type (this enum value must be added to the existing GeneratorTypes enum)
3. THE generated code SHALL follow the pattern established in supplier.service.ts save method
4. WHERE an Account has a parentAccountId, THE generated code SHALL incorporate the parent account code as a prefix to maintain hierarchical numbering

### Requirement 9: Transaction Number Generation

**User Story:** As an accountant, I want transaction reference numbers to be automatically generated, so that I can uniquely identify each transaction.

#### Acceptance Criteria

1. WHEN creating a new Transaction, THE Accounting_Module SHALL generate a unique referenceNumber using a generator utility function
2. THE generated referenceNumber SHALL follow a sequential pattern similar to generateUniqueJourneyNumber in journey.service.ts
3. THE referenceNumber SHALL be immutable after creation
4. THE referenceNumber format SHALL be "TXN-{year}-{sequential_number}" (e.g., "TXN-2024-00001")

### Requirement 10: Module Structure and Integration

**User Story:** As a developer, I want the accounting module to follow the existing project structure, so that it integrates seamlessly with the codebase.

#### Acceptance Criteria

1. THE Accounting_Module SHALL be located in src/app/modules/accounting directory
2. THE Accounting_Module SHALL contain subdirectories: dtos/ for DTOs, and root-level files for entity, service, controller, mapper, and module
3. THE Accounting_Module SHALL export an AccountingModule class decorated with @Module following the pattern in journey.module.ts
4. THE AccountingModule SHALL import TypeOrmModule.forFeature with Account, Transaction, and TransactionLine entities
5. THE AccountingModule SHALL declare and export AccountService, TransactionService, TransactionLineService, AccountController, and TransactionController
6. THE Accounting_Module SHALL be imported into the main AppModule in src/app/app.module.ts
7. THE Accounting_Module file naming SHALL follow kebab-case convention (account.entity.ts, transaction.service.ts, etc.)
8. THE Accounting_Module class naming SHALL follow PascalCase convention (Account, TransactionService, AccountController, etc.)

### Requirement 11: API Documentation

**User Story:** As an API consumer, I want comprehensive API documentation, so that I can understand how to interact with the accounting endpoints.

#### Acceptance Criteria

1. THE AccountController and TransactionController SHALL use @ApiTags decorator to group endpoints in Swagger documentation
2. THE AccountController SHALL use @ApiTags('accounting-accounts')
3. THE TransactionController SHALL use @ApiTags('accounting-transactions')
4. WHEN defining controller methods, THE Accounting_Module SHALL use @ApiOperation decorator with summary and description
5. WHEN defining controller methods, THE Accounting_Module SHALL use @ApiResponse decorator to document response types and status codes
6. THE DTOs SHALL use @ApiProperty and @ApiPropertyOptional decorators to document all fields following the pattern in journey.dto.ts and supplier.dto.ts
7. THE DTOs SHALL include example values in @ApiProperty decorators where appropriate

### Requirement 12: Query and Filtering Capabilities

**User Story:** As an accountant, I want to query and filter accounts and transactions, so that I can find specific financial records efficiently.

#### Acceptance Criteria

1. THE QueryAccountDTO SHALL extend PaginateDTO to support pagination parameters (page, pageSize, sortField, sortOrder)
2. THE QueryAccountDTO SHALL support filtering by type (AccountType enum)
3. THE QueryAccountDTO SHALL support filtering by isActive (boolean)
4. THE QueryTransactionDTO SHALL extend PaginateDTO to support pagination parameters
5. THE QueryTransactionDTO SHALL support filtering by status (TransactionStatus enum)
6. THE QueryTransactionDTO SHALL support filtering by date range (dateFrom, dateTo)
7. THE QueryTransactionDTO SHALL support filtering by referenceType and referenceId
8. THE AccountService.findAndCount SHALL accept QueryAccountDTO and apply filters using TypeORM query builder or FindManyOptions
9. THE TransactionService.findAndCount SHALL accept QueryTransactionDTO and apply filters using TypeORM query builder or FindManyOptions
