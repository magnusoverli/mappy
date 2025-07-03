# Agents for Mappy INI Editor

This document outlines the core "agents" (logical modules) in the Mappy web application. Each agent encapsulates a specific responsibility in the flow of loading, editing, validating, and exporting NEVION iPath INI configuration files. The goal is to keep each area of functionality cleanly separated, making the codebase easier to maintain and extend.

---

## 1. FileAgent

**Responsibility:**

* Handle all file I/O operations.
* Open `.ini` files via user file picker.
* Read raw text from disk.
* Trigger export of edited content back to a downloadable `.ini` file.

**Key Functions:**

* `openFile()` → reads `File` object into text.
* `exportFile(data: string)` → creates Blob and initiates download.

---

## 2. ParserAgent

**Responsibility:**

* Convert raw INI text into a JavaScript object tree.
* Serialize JS object back into INI-format text.

**Dependencies:**

* Uses the `ini` npm package.

**Key Functions:**

* `parseIni(text: string): IniData`
* `stringifyIni(data: IniData): string`

---

## 3. ValidationAgent

**Responsibility:**

* Enforce syntax rules on sections, keys, and values.
* Ensure section names only include `Layers`, `Targets`, `Sources`.
* Validate key formats (`XX`, `XX.YYYY`).
* Validate values (paths or 8‑digit hex IDs).

**Key Functions:**

* `validateSection(name: string): boolean`
* `validateKey(section: string, key: string): boolean`
* `validateValue(section: string, value: string): boolean`
* `getValidationErrors(): ValidationError[]`

---

## 4. SectionAgents

Each INI section gets its own agent to model its rows and enforce section-specific logic.

### 4.1 LayersAgent

* Manages entries in the `[Layers]` section.
* Enforces: key = `NN`, value = `/Nevion/VideoIPath/.../Matrix`.

### 4.2 TargetsAgent

* Manages `[Targets]` entries.
* Enforces: key = `NN.CCCC`, value = 8‑digit hex.

### 4.3 SourcesAgent

* Manages `[Sources]` entries.
* Same format rules as `TargetsAgent`.

**Key Functions (common):**

* `addEntry(key: string, value: string)`
* `removeEntry(key: string)`
* `updateEntry(key: string, value: string)`
* `listEntries(): Array<{ key, value }>`

---

## 5. UIAgent

**Responsibility:**

* Coordinate user interactions in React components.
* Maintain current state: raw text, parsed data, selected section.
* Dispatch to FileAgent, ParserAgent, ValidationAgent, and SectionAgents.

**Key React Hooks & Context:**

* `useState` for text, data, selectedSection.
* `useEffect` to re-parse on text change.
* Context provider to expose `data` and update functions.

---

## 6. DownloadAgent

**Responsibility:**

* Wraps export logic with UI feedback (e.g., disabled button during generation).
* Optionally formats timestamped filenames.

---

## 7. (Optional) TelemetryAgent

**Responsibility:**

* Collect anonymized usage metrics (e.g., section edits, exports).
* Helps guide future UX improvements.

---

## 8. .ini file structure and syntax description

1. File format
Encoding: UTF-8, Unix line-endings (\n)

Sections: Denoted by [SectionName] on its own line

Entries: key = value (spaces around = are optional but canonical)

Blank lines: Allowed anywhere

Comments: Not used in this file (you can choose to support ; or # if you like)

2. Sections
This file has exactly three top-level sections, each with its own key-value pattern:

A) [Layers]
Key: two decimal digits, zero-padded (00 through 41)

Value: a Unix-style path string, always starting with

swift
Copy
Edit
/Nevion/VideoIPath/Version1/
ending in either

…/Connection/l<nn>/Matrix

…/Device/<DeviceName>/Audio Levels/level_<nn>/Matrix

Example:

swift
Copy
Edit
03 = /Nevion/VideoIPath/Version1/Connection/l77/Matrix
B) [Targets]
Key: <LL>.<CCCC>

LL = layer ID (same two-digit as in [Layers])

CCCC = channel index, four decimal digits, zero-padded (0000–XXXX)

Value: eight hexadecimal digits, zero-padded (00000000–FFFFFFFF), uppercase or lowercase

Example:

ini
Copy
Edit
03.0005 = 00A1B2C3
C) [Sources]
Key: <LL>.<SSSS>

LL = layer ID (two digits)

SSSS = source index, four digits (0000–9999)

Value: eight-digit hex ID, same format as in [Targets]

Example:

ini
Copy
Edit
03.0010 = 0000ABCD
3. Validation rules
Section names must be exactly Layers, Targets or Sources (case-sensitive).

Keys must match the regexes:

Layers: ^[0-9]{2}$

Targets/Sources: ^[0-9]{2}\.[0-9]{4}$

Values for hex IDs: ^[0-9A-Fa-f]{8}$

Values for layer paths: must start with /Nevion/VideoIPath/Version1/ and end in /Matrix.

4. Editor features to support
Section picker (Layers, Targets, Sources)

Key input masks

Layers → 2-digit only

Targets/Sources → 2-digit + dot + 4-digit

Value input validation

Paths (autocomplete or free-text) for Layers

Hex-ID fields (8 hex chars) for Targets/Sources

Add/Delete rows within each section

Live syntax check before export

Export back to .ini preserving:

Section order: Layers → Targets → Sources

Entry order (or sorted, if you choose)

Blank lines between sections
*End of agents.md*
