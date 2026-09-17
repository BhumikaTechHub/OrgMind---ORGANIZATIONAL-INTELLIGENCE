---
title: "Agent Usage Guide"
description: "Best practices for working with AI agents in daily development"
---

[TOC]

## How Agents Work

An AI model is a single call — you send a prompt, you get a response. An agent is that same model running in a loop: it receives your request, decides on an action (read a file, run a command, edit code), observes the result, and repeats until the task is done.

For a deeper dive, see Anthropic's [building effective agents](https://www.anthropic.com/research/building-effective-agents) writeup.

## How MCPs Work

MCP (Model Context Protocol) servers extend what an agent can do by connecting it to external tools and data sources — think Snowflake, GitLab, dbt, Slack. Each active MCP adds to the agent's context window, so only enable what you actually need for the task at hand.

## Configuration

OpenCode uses two config files that merge at runtime — a global config (`~/.opencode/config.json`) and a project-level config (`.opencode/config.json` at the repo root). Project settings override global ones when they collide.

Keep your global config minimal. The main thing worth putting there is MCPs you need in every session regardless of what you're working on. Everything else — especially repo-specific MCPs like `dbt-mcp` — belongs in the project config. For example, `dbt-mcp` lives only in the analytics repo config since it's only relevant there.

A good rule of thumb: if you'd want the MCP active even when you open OpenCode outside of any project, it goes global. Otherwise, keep it local.

## Best Practices

Keep context lean. Start a new conversation any time you shift focus — a new feature, a different bug, an unrelated review. When in doubt, fresh window. In OpenCode, use the `/new` command to do that. This improves quality of responses as well as costs

If a skill exists for what you're doing, use it — skills give the agent domain-specific context it wouldn't otherwise have.

### Analytics Engineer

The AE team uses OpenCode across the full development lifecycle — building and modifying dbt models, responding to MR review feedback, troubleshooting pipeline failures, testing and validating data, exploring datasets, and drafting issues from context like Slack threads or review comments.

#### Recommended Workflow

- For new or unfamiliar tasks, start in **Plan** mode — review the proposed approach before making any changes
- For well-understood tasks, go directly to **Build** or the AE agent
- Begin prompts with "I want to…" and describe the change, review comment, or question you are working through
- For MR reviews, open a fresh session scoped to that review
- For more detail on the two modes, see [When to Use Plan vs Build Mode](#when-to-use-plan-vs-build-mode) below

#### Session Management, Model Selection, and Cost Efficiency

- Start a new session per MR, topic, or day — the guiding question is whether the prior context is actually needed for the next task; if not, start fresh
- A medium sized model, like **Sonnet 4.6**, is the recommended default model — they offer a good balance of quality, speed, and cost; larger models are slower and more expensive without proportional gains for most AE tasks
- Input tokens seem to be the most expensive component of a session — keep context lean, use `/compact` when it grows large, and start a new session before reaching the 200K token threshold
- Only enable the MCPs needed for the current task — use the `/mcps` command and press `space` to toggle MCPs on or off

#### MCP Setup

Snowflake MCP is required for most AE development work. If you run into issues configuring it, refer to the setup and troubleshooting video: **[placeholder — link to Snowflake MCP setup video coming soon]**

## When to Use Plan vs Build Mode

OpenCode has two primary modes:

- **Plan** — reviews your request and relevant code, then proposes a detailed approach *before* making any changes
- **Build** — executes changes directly

Always run Plan first for anything non-trivial. It's surprisingly good at catching design issues before you're already mid-implementation.

If you've set `plan` as your default agent (recommended in the [setup guide](agent-setup.md#step-6-set-plan-as-your-default-agent)), you'll be in Plan mode by default. Switch to Build mode explicitly when you're ready to execute.

## Skills

Skills encode reusable, team-specific knowledge — conventions, workflows, and best practices that would otherwise need to be re-explained every session. Rather than prompting from scratch, invoking a skill gives the agent the right context immediately.

### How to Use Skills

Skills are automatically invoked by AI coding tools like OpenCode when the task described in your prompt matches the skill's frontmatter metadata. Well-written frontmatter (especially `name` and `description` fields) enables automatic discovery. You can also explicitly mention a skill by name in your prompt if you know it exists.

### Available Skills

For a list of skills developed by the Data Team, see the [Available Skills](agentic-tool-development.md#available-skills) section in the Agentic Tool Development guide.

### Setup

To enable skills in your OpenCode environment, follow the [Skills Setup](agent-setup.md#skills-setup) instructions in the Agent Setup guide.
