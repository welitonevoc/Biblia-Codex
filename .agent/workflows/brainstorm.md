---
description: Structured brainstorming for projects and features. Explores multiple options before implementation.
---

# /brainstorm - Structured Idea Exploration

$ARGUMENTS

---

## Purpose

This command activates BRAINSTORM mode for structured idea exploration. Use when you need to explore options before committing to an implementation.

---

## Behavior

When `/brainstorm` is triggered:

1. **Understand the goal**
   - What problem are we solving?
   - Who is the user?
   - What constraints exist?

2. **Generate options**
   - Provide at least 3 different approaches
   - Each with pros and cons
   - Consider unconventional solutions

3. **Compare and recommend**
   - Summarize tradeoffs
   - Give a recommendation with reasoning

---

## Output Format

```markdown
## 🧠 Brainstorm: [Topic]

### Context
[Brief problem statement]

---

### Option A: [Name]
[Description]

✅ **Pros:**
- [benefit 1]
- [benefit 2]

❌ **Cons:**
- [drawback 1]

📊 **Effort:** Low | Medium | High

---

### Option B: [Name]
[Description]

✅ **Pros:**
- [benefit 1]

❌ **Cons:**
- [drawback 1]
- [drawback 2]

📊 **Effort:** Low | Medium | High

---

### Option C: [Name]
[Description]

✅ **Pros:**
- [benefit 1]

❌ **Cons:**
- [drawback 1]

📊 **Effort:** Low | Medium | High

---

## 💡 Recommendation

**Option [X]** because [reasoning].

What direction would you like to explore?
```

---

## Examples

```
/brainstorm authentication system
/brainstorm state management for complex form
/brainstorm database schema for social app
/brainstorm caching strategy
/brainstorm data migration strategy (androidbible → YouVersionPlatform)
```

---

## Example Output: Data Migration Analysis

```markdown
## 🧠 Brainstorm: Migration of Bookmarks from androidbible to YouVersionPlatform

### Context
User wants to import bookmarks, notes, and labels from androidbible-develop project.
Need to preserve relationships: Notes → Labels → Bookmarks.

---

### Option A: Direct Database Migration
Copy SQLite tables directly and convert schema

✅ **Pros:**
- Fast execution (single operation)
- Preserves all data including metadata
- No intermediate files needed

❌ **Cons:**
- Requires both databases on same device
- Schema differences may cause issues
- Risk of data corruption if conversion fails

📊 **Effort:** Medium

---

### Option B: CSV Export/Import
Export from androidbible as CSV, import to YouVersionPlatform

✅ **Pros:**
- Platform independent (works across devices)
- Human-readable format
- Easy to validate and debug
- User can edit before importing

❌ **Cons:**
- May lose some metadata (timestamps, sync status)
- Requires implementation of export/import logic
- Need to handle versification differences

📊 **Effort:** Low

---

### Option C: JSON with Validation
Export as JSON with schema validation

✅ **Pros:**
- Structured format with validation
- Can include full metadata
- Easier to handle complex relationships
- Better error reporting

❌ **Cons:**
- Larger file size
- More complex to parse
- Requires both apps to support JSON format

📊 **Effort:** Medium

---

### Option D: Keep Existing System (Do Nothing)
Analyze and conclude current system is already better

✅ **Pros:**
- No development time needed
- Current system already superior (Room, more types, Compose)
- No risk of data loss in migration

❌ **Cons:**
- Users can't migrate existing bookmarks
- May frustrate users switching from androidbible

📊 **Effort:** None

---

## 💡 Recommendation

**Option B (CSV Export/Import)** because:
1. androidbible already has CSV export functionality
2. Platform independent and user-friendly
3. Low effort to implement
4. Allows user to review/edit before importing

**Implementation Priority:**
1. Implement exportBookmarksToCsv() in RoomBookmarkRepository (30 min)
2. Implement importBookmarksFromCsv() in RoomBookmarkRepository (30 min)
3. Add deduplication logic (30 min)
4. Test with real data (30 min)

**Total Estimated Time:** 2 hours

What direction would you like to explore?
```

---

## Key Principles

- **No code** - this is about ideas, not implementation
- **Visual when helpful** - use diagrams for architecture
- **Honest tradeoffs** - don't hide complexity
- **Defer to user** - present options, let them decide
