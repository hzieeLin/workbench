# Personal Task Orchestrator - Design Specification

## [S1] Problem Statement

Build a simplified Trello-like desktop application focused on personal task orchestration. The application should combine visual task management (Kanban boards) with time planning features and data statistics, providing a comprehensive personal productivity tool.

## [S2] Solution Overview

A desktop application built with Electron + Vue 3 + TypeScript that provides:
- Kanban board view for visual task management
- Calendar and time block planning views
- Data statistics and efficiency analysis
- Local MySQL database storage
- Modern card-style UI design

## [S3] Architecture Design

### [S3.1] System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐│
│  │ Board View  │ │ Calendar    │ │ Statistics View     ││
│  │ (Vue 3)     │ │ View        │ │ (Chart.js)         ││
│  └─────────────┘ └─────────────┘ └─────────────────────┘│
├─────────────────────────────────────────────────────────┤
│                    Business Layer                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐│
│  │ Board       │ │ Time        │ │ Statistics          ││
│  │ Service     │ │ Service     │ │ Service             ││
│  └─────────────┘ └─────────────┘ └─────────────────────┘│
├─────────────────────────────────────────────────────────┤
│                    Data Layer                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐│
│  │ MySQL       │ │ File        │ │ Cache               ││
│  │ Database    │ │ Storage     │ │ (Optional)          ││
│  └─────────────┘ └─────────────┘ └─────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### [S3.2] Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Vue 3 + TypeScript + Vite | UI rendering and user interaction |
| UI Library | Element Plus | Component library |
| State Management | Pinia | Application state management |
| Database | MySQL (local) | Data persistence |
| ORM | TypeORM | Database operations |
| Desktop Framework | Electron | Cross-platform desktop app |
| Testing | Jest + Vue Test Utils | Unit and component testing |
| E2E Testing | Playwright | End-to-end testing |

## [S4] Data Model Design

### [S4.1] Core Entities

#### Board (看板)
```typescript
interface Board {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}
```

#### List (列表)
```typescript
interface List {
  id: number;
  board_id: number;
  name: string;
  position: number;
  created_at: Date;
}
```

#### Card (任务卡片)
```typescript
interface Card {
  id: number;
  list_id: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  due_date?: Date;
  position: number;
  created_at: Date;
  updated_at: Date;
}
```

#### Label (标签)
```typescript
interface Label {
  id: number;
  name: string;
  color: string;
}
```

#### CardLabel (卡片标签关联)
```typescript
interface CardLabel {
  card_id: number;
  label_id: number;
}
```

### [S4.2] Time Planning Entities

#### TimeBlock (时间块)
```typescript
interface TimeBlock {
  id: number;
  card_id?: number;
  start_time: Date;
  end_time: Date;
  title: string;
}
```

#### CalendarEvent (日历事件)
```typescript
interface CalendarEvent {
  id: number;
  title: string;
  start_time: Date;
  end_time: Date;
  description?: string;
}
```

### [S4.3] Statistics Entities

#### ActivityLog (活动日志)
```typescript
interface ActivityLog {
  id: number;
  card_id: number;
  action: 'created' | 'updated' | 'completed' | 'deleted';
  timestamp: Date;
}
```

## [S5] UI Design

### [S5.1] Main Layout

```
┌─────────────────────────────────────────────────────────┐
│  Logo  │  Search Bar                    │  Settings  👤 │
├─────────┼───────────────────────────────┼────────────────┤
│         │                               │                │
│  Board  │                               │                │
│  List   │      Main Content Area        │                │
│         │                               │                │
│  Time   │   (Board/Calendar/Stats)      │                │
│  Plan   │                               │                │
│         │                               │                │
│  Stats  │                               │                │
│         │                               │                │
├─────────┴───────────────────────────────┴────────────────┤
│                    Status Bar                            │
└─────────────────────────────────────────────────────────┘
```

### [S5.2] Board View

- Left sidebar: Board list
- Main area: Kanban columns (Lists)
- Each column contains draggable task cards
- Click card to open detail panel
- Filter by labels, priority, due date

### [S5.3] Time Planning View

- Calendar view: Month/Week/Day toggle
- Time block view: Drag to create time blocks
- Task association: Drag tasks into time blocks
- Reminder settings for events

### [S5.4] Statistics View

- Completion rate: Bar charts, line charts
- Efficiency analysis: Time distribution, trends
- Data export: CSV/JSON formats

## [S6] Feature Design

### [S6.1] Board Features

1. **Board Management**
   - Create new board
   - Edit board name and description
   - Delete board (with confirmation)

2. **List Management**
   - Create new list
   - Edit list name
   - Delete list
   - Drag to reorder lists

3. **Card Management**
   - Create new card with title and description
   - Edit card details
   - Delete card
   - Drag to move cards between lists
   - Set priority (low/medium/high)
   - Set due date
   - Add/remove labels

4. **Label Management**
   - Create new label with name and color
   - Edit label
   - Delete label
   - Apply labels to cards

5. **Filtering**
   - Filter by labels
   - Filter by priority
   - Filter by due date range
   - Search by title/description

### [S6.2] Time Planning Features

1. **Calendar Views**
   - Month view: See all events
   - Week view: Detailed weekly schedule
   - Day view: Hourly time blocks

2. **Time Block Management**
   - Create time block by clicking/dragging
   - Edit time block details
   - Delete time block
   - Drag to resize/reposition

3. **Task Association**
   - Drag tasks from board to time blocks
   - View task details in time block
   - Remove task association

4. **Reminders**
   - Set reminders for events
   - Desktop notifications
   - Configurable reminder times

### [S6.3] Statistics Features

1. **Completion Statistics**
   - Task completion rate
   - Daily/weekly/monthly trends
   - Board-specific statistics

2. **Time Statistics**
   - Work time tracking
   - Time distribution by board/label
   - Productivity trends

3. **Data Export**
   - Export to CSV
   - Export to JSON
   - Custom date range export

### [S6.4] General Features

1. **Keyboard Shortcuts**
   - `Ctrl+N`: New card
   - `Ctrl+B`: New board
   - `Ctrl+L`: New list
   - `Delete`: Delete selected item
   - `Ctrl+F`: Focus search
   - `Escape`: Close dialogs

2. **Data Management**
   - Auto-save to local MySQL
   - Data backup/restore
   - Import from other formats

3. **Search**
   - Global search across all boards
   - Search by title, description, labels
   - Recent searches

4. **Settings**
   - Theme customization
   - Notification preferences
   - Data management options

## [S7] Error Handling

### [S7.1] Database Errors

- **Connection Failure**: Display friendly error message with retry option
- **Query Errors**: Log errors, show user-friendly messages
- **Data Corruption**: Backup mechanism, recovery options

### [S7.2] Validation Errors

- **Form Validation**: Real-time validation with visual feedback
- **Data Validation**: Server-side validation before database operations
- **Type Checking**: TypeScript compile-time type safety

### [S7.3] UI Errors

- **Component Errors**: Error boundaries, fallback UI
- **Network Errors**: Offline mode support (if applicable)
- **File Operation Errors**: Permission checks, backup mechanism

## [S8] Testing Strategy

### [S8.1] Unit Tests

- **Framework**: Jest + Vue Test Utils
- **Coverage**: All business logic services
- **Focus**: Data models, utility functions, service methods

### [S8.2] Component Tests

- **Framework**: Vue Test Utils
- **Coverage**: All Vue components
- **Focus**: Rendering, user interactions, event emission

### [S8.3] Integration Tests

- **Framework**: Jest
- **Coverage**: Module interactions
- **Focus**: Service layer integration, database operations

### [S8.4] E2E Tests

- **Framework**: Playwright
- **Coverage**: Critical user flows
- **Focus**: Board creation, card management, time planning

### [S8.5] Quality Assurance

- **TypeScript**: Strict mode enabled
- **ESLint**: Code quality rules
- **Prettier**: Code formatting
- **Git Hooks**: Pre-commit checks

## [S9] Implementation Plan

### [S9.1] Phase 1: Project Setup (Week 1)

1. Initialize Electron + Vue 3 + Vite project
2. Set up TypeScript configuration
3. Configure ESLint and Prettier
4. Set up MySQL database connection
5. Create basic project structure

### [S9.2] Phase 2: Data Layer (Week 2)

1. Design and create database schema
2. Set up TypeORM entities
3. Implement database migration system
4. Create base repository pattern

### [S9.3] Phase 3: Board Features (Week 3-4)

1. Implement board CRUD operations
2. Implement list management
3. Implement card management
4. Add drag-and-drop functionality
5. Implement label system

### [S9.4] Phase 4: Time Planning (Week 5)

1. Implement calendar views
2. Create time block management
3. Add task association
4. Implement reminders

### [S9.5] Phase 5: Statistics (Week 6)

1. Implement completion statistics
2. Add time tracking
3. Create data visualization
4. Implement data export

### [S9.6] Phase 6: Polish and Testing (Week 7-8)

1. Add keyboard shortcuts
2. Implement search functionality
3. Write comprehensive tests
4. Performance optimization
5. Bug fixes and refinements

## [S10] Success Criteria

1. ✅ Application launches and runs on Windows/macOS/Linux
2. ✅ Users can create and manage boards, lists, and cards
3. ✅ Drag-and-drop functionality works smoothly
4. ✅ Calendar and time block views are functional
5. ✅ Statistics and charts display correctly
6. ✅ Data persists in local MySQL database
7. ✅ Application performs well with 100+ cards
8. ✅ All critical user flows have E2E tests
9. ✅ Code coverage meets quality standards

---

**Document Version**: 1.0
**Created**: 2026-06-13
**Author**: MiMoCode
**Status**: Approved
