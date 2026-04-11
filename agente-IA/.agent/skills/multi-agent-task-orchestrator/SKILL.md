# Multi-Agent Task Orchestrator

## Overview

A production-tested pattern for coordinating multiple AI agents through a single orchestrator. Instead of letting agents work independently (and conflict), one orchestrator decomposes tasks, routes them to specialists, prevents duplicate work, and verifies results before marking anything done.

## When to Use This Skill

- Use when you have 3+ specialized agents that need to coordinate on complex tasks
- Use when agents are doing duplicate or conflicting work
- Use when you need audit trails showing who did what and when
- Use when agent output quality is inconsistent and needs verification gates

## How It Works

### Step 1: Define the Orchestrator Identity

The orchestrator must know what it IS and what it IS NOT:

You are the Task Orchestrator. You NEVER do specialized work yourself.
You decompose tasks, delegate to the right agent, prevent conflicts,
and verify quality before marking anything done.

**WHAT YOU ARE NOT:**
- NOT a code writer — delegate to code agents
- NOT a researcher — delegate to research agents
- NOT a tester — delegate to test agents

### Step 2: Build a Task Registry

Before assigning work, check if anyone is already doing this task. Use a simple registry to track:
- Task ID
- Description
- Assigned agent
- Status (pending, in_progress, done)

### Step 3: Route Tasks to Specialists

Use keyword scoring to match tasks to the best agent:

```
AGENTS = {
  "code-architect": ["code", "implement", "function", "bug", "fix", "refactor", "api"],
  "security-reviewer": ["security", "vulnerability", "audit", "cve"],
  "researcher": ["research", "compare", "analyze", "benchmark"],
  "doc-writer": ["document", "readme", "explain", "tutorial"],
  "test-engineer": ["test", "coverage", "unittest", "pytest"],
}
```

### Step 4: Enforce Quality Gates

Agent output is a CLAIM. Test output is EVIDENCE.

After agent reports completion:
1. Were files actually modified? (git diff --stat)
2. Do tests pass? (npm test)
3. Were secrets introduced?
4. Did the build succeed?
5. Were only intended files touched?

Mark done ONLY after ALL checks pass.

### Step 5: Run 30-Minute Heartbeats

Every 30 minutes:
1. What have I DELEGATED in the last 30 minutes?
2. If nothing → assign the next task
3. Check for idle agents
4. Relance idle agents or reassign

## Best Practices

- Always define NOT-blocks for every agent (what they must refuse to do)
- Set similarity threshold at 55% for anti-duplication
- Require evidence-based quality gates (not just agent claims)
- Log every delegation with: task ID, agent, scope, deadline, verification command

## Common Pitfalls

- **Orchestrator starts doing work instead of delegating**
  - Solution: Add explicit NOT-blocks and role boundaries

- **Two agents modify the same file simultaneously**
  - Solution: Task registry with file-level locking

- **Agent claims "done" without actual changes**
  - Solution: Quality gate checks git diff before accepting

- **Tasks pile up without progress**
  - Solution: 30-minute heartbeat catches stale assignments