# Agents for Mappy

This document outlines the core "agents" (logical modules) in the Mappy web application. Each agent encapsulates a specific responsibility in the flow of loading, editing, validating, and exporting VSM mapping files. The goal is to keep each area of functionality cleanly separated, making the codebase easier to maintain and extend.

Mappy is built to edit and manipulate VSM mapping files. These files describe paths to various external systems that VSM integrates with. Paths may include Nevion or VideoIPath segments but can reference any system name.

---

## 1. FileAgent

**Responsibility:**
* Handle all file I/O operations
* Open `.ini` files via user file picker
* Read raw text from disk while preserving line endings
* Trigger export of edited content back to a downloadable `.ini` file

**Key Functions:**
* `openFile(file: File): Promise<{text: string, newline: string}>` → reads File object into text and detects line ending type
* `exportFile(data: string, filename: string)` → creates Blob and initiates download

**Implementation Details:**
* Detects and preserves original line ending format (`\n`, `\r\n`, or `\r`)
* Uses FileReader API for async file reading
* Creates temporary download links using blob URLs

---

## 2. ParserAgent

**Responsibility:**
* Convert raw INI text into a JavaScript object tree
* Serialize JS object back into INI-format text
* Preserve formatting requirements specific to VSM mapping files

**Dependencies:**
* Uses the `ini` npm package

**Key Functions:**
* `parseIni(text: string): IniData`
* `stringifyIni(data: IniData, newline: string): string`

**Special Formatting:**
* Wraps layer path values in quotes
* Preserves whitespace around `=` signs
* Maintains original line ending format

---

## 3. LayersAgent

**Responsibility:**
* Manage entries in the `[Layers]` section
* Handle layer CRUD operations
* Maintain proper key formatting (2-digit zero-padded)

**Key Functions:**
* `listLayers(data: IniData): Array<{key: string, value: string}>` → returns sorted layer list
* `updateLayer(data: IniData, index: number, newKey: string, newValue: string)` → updates layer in-place
* `addLayer(data: IniData): string` → adds new layer with next available key
* `removeLayer(data: IniData, key: string)` → removes layer by key

**Implementation Details:**
* Automatically finds next available layer key (00-99)
* Maintains numeric sorting of layers
* Handles key renaming when updating

---

## 4. TargetsAgent

**Responsibility:**
* Group and analyze `[Targets]` entries by layer
* Calculate offset values for validation
* Provide structured data for UI display

**Key Functions:**
* `groupTargetsByLayer(data: IniData): Record<string, Array<{key: string, value: string, offset: number}>>`

**Format Rules:**
* Key format: `NN.CCCC` (layer.channel, e.g., "03.0005")
* Value format: 8-digit hex (e.g., "00A1B2C3")
* Offset calculation: decimal(channel) - hex(value)

---

## 5. SourcesAgent

**Responsibility:**
* Group and analyze `[Sources]` entries by layer
* Calculate offset values for validation
* Provide structured data for UI display

**Key Functions:**
* `groupSourcesByLayer(data: IniData): Record<string, Array<{key: string, value: string, offset: number}>>`

**Format Rules:**
* Key format: `NN.SSSS` (layer.source, e.g., "03.0010")
* Value format: 8-digit hex (e.g., "0000ABCD")
* Offset calculation: decimal(source) - hex(value)

---

## 6. StorageAgent

**Responsibility:**
* Persist application state to localStorage
* Restore previous editing sessions
* Handle storage errors gracefully

**Key Functions:**
* `loadState(): SavedState | null` → retrieves saved state
* `saveState(state: {text: string, fileName: string, newline: string})` → persists current state
* `clearState()` → removes saved state

**Implementation Details:**
* Stores serialized INI text, filename, and line ending format
* Enables seamless session recovery on page reload
* Handles JSON parse/stringify errors

---

## 7. React Integration Layer (useMappingEditor Hook)

**Responsibility:**
* Orchestrate all agents in a React-friendly way
* Manage component state and side effects
* Provide a clean API for UI components

**Key State:**
* `iniData` - parsed INI object
* `layers` - sorted array of layer objects
* `targets` - targets grouped by layer
* `sources` - sources grouped by layer
* `selectedLayer` - currently selected layer key
* `fileName` - current file name
* `newline` - line ending format
* `status` - user feedback messages
* `loading` - async operation state

**Key Functions:**
* `handleFileChange` - processes file uploads
* `download` - exports current state
* `handlePathChange` - updates layer paths
* `handleAddLayer` - creates new layers
* `handleRemoveLayer` - deletes layers
* `reset` - clears all state

---

## INI File Structure and Syntax

### 1. File Format
* **Encoding:** UTF-8 (encoding and metadata of uploaded files must be maintained)
* **Sections:** Denoted by `[SectionName]` on its own line
* **Entries:** `key = value` (spaces around `=` are optional but canonical)
* **Blank lines:** Allowed anywhere
* **Comments:** Not used in VSM mapping files

### 2. Sections
This file has exactly three top-level sections, each with its own key-value pattern:

#### A) [Layers]
* **Key:** Two decimal digits, zero-padded (00 through 99)
* **Value:** Unix-style path string describing the destination system
* Path typically ends with `/Matrix`
* Common formats:
  - `…/Connection/l<nn>/Matrix`
  - `…/Device/<DeviceName>/Audio Levels/level_<nn>/Matrix`
* Example: `03 = "/Nevion/VideoIPath/Version1/Connection/l77/Matrix"`

#### B) [Targets]
* **Key:** `<LL>.<CCCC>`
  - LL = layer ID (same two-digit as in [Layers])
  - CCCC = channel index, four decimal digits, zero-padded (0000–9999)
* **Value:** Eight hexadecimal digits, zero-padded (00000000–FFFFFFFF)
* Example: `03.0005 = 00A1B2C3`

#### C) [Sources]
* **Key:** `<LL>.<SSSS>`
  - LL = layer ID (two digits)
  - SSSS = source index, four digits (0000–9999)
* **Value:** Eight-digit hex ID, same format as [Targets]
* Example: `03.0010 = 0000ABCD`

### 3. Validation Rules
* Section names must be exactly `Layers`, `Targets`, or `Sources` (case-sensitive)
* Keys must match the regexes:
  - Layers: `^[0-9]{2}$`
  - Targets/Sources: `^[0-9]{2}\.[0-9]{4}$`
* Values for hex IDs: `^[0-9A-Fa-f]{8}$`

### 4. Editor Features
* **Section Management:** View and edit all three sections
* **Layer Management:** Add, edit, delete layers with automatic key assignment
* **Path Editing:** Free-text editing of layer paths
* **Data Visualization:** Display targets/sources grouped by layer with offset calculations
* **Validation:** Visual indicators for offset mismatches
* **Session Persistence:** Automatic save/restore of editing sessions
* **Export:** Download edited files preserving original formatting

---

## Architecture Benefits

1. **Separation of Concerns:** Each agent has a single, well-defined responsibility
2. **Testability:** Agents are pure functions/modules that can be unit tested independently
3. **Reusability:** Agents can be used in different contexts (React, CLI, etc.)
4. **Maintainability:** Changes to one aspect don't ripple through the entire codebase
5. **Type Safety:** Clear interfaces make TypeScript adoption straightforward
6. **Performance:** Efficient data structures and algorithms (e.g., virtualized lists for large files)

---

## Future Extensibility

The agent architecture makes it easy to add new features:
* **ValidationAgent:** Could be added for comprehensive syntax/semantic validation
* **DiffAgent:** Compare two mapping files
* **BatchAgent:** Process multiple files at once
* **ImportAgent:** Support additional file formats
* **HistoryAgent:** Undo/redo functionality
* **CollaborationAgent:** Real-time multi-user editing

*End of agents.md*