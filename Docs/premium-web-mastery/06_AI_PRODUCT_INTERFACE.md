# 06 — AI PRODUCT INTERFACE DESIGN

## 1. The AI-product problem

AI products easily become visually generic because many use the same tropes:

- chat bubbles
- gradients
- sparkle icons
- glowing orb
- “ask AI” buttons everywhere

A premium AI product should make intelligence feel like a **capability embedded in a workflow**, not a decoration pasted onto a normal app.

---

## 2. The core metaphor

Prefer:

**AI as collaborator / operator / analyst / engine / layer / instrument**

over:

**AI as magical purple robot.**

The visual language should communicate precision and capability.

---

## 3. AI interaction states

Design at least these states intentionally:

### Ready

Clear affordance and context.

### Thinking

Subtle status. Do not use a giant spinner unless appropriate.

### Streaming

Content emerges with controlled movement.

### Tool use

Make actions legible: searching, running, checking, generating, editing.

### Completed

Present the result in a structured way.

### Needs input

Clearly state what the human must provide.

### Uncertain

Represent uncertainty rather than pretending confidence.

### Failed

Show what happened and what can be retried.

### Human approval

Make control boundaries explicit for consequential actions.

---

## 4. AI visual hierarchy

The most important content remains the result, not the “AI” label.

A useful hierarchy:

**user goal → AI action → evidence → result → controls**

Avoid:

**AI badge → sparkle icon → huge system label → tiny result**

---

## 5. Streaming motion

Streaming should feel intentional.

Use:

- progressive text appearance
- subtle cursor/caret where meaningful
- status labels
- lightweight skeletons for known structures

Avoid visually repainting huge blocks every frame.

---

## 6. AI-generated content should feel owned

Generated content should be visually integrated with the product.

Avoid making every output a floating chat bubble.

Possible representations:

- document draft
- code diff
- research synthesis
- analysis panel
- table
- timeline
- recommendation set
- editable artifact

The AI can disappear into the workflow when the result becomes the object the user actually cares about.

---

## 7. Trust patterns

For important AI output, consider showing:

- source context
- citations
- tool actions
- confidence/uncertainty where meaningful
- edit history
- human approval state
- reversible actions

Trust comes from inspectability and control, not visual glow.

---

## 8. AI command surfaces

Command palettes, agent panels, and assistants should feel like **high-end tools**:

- compact typography
- dense but readable layout
- keyboard shortcuts
- obvious focus
- high contrast
- predictable dismissal
- subtle elevation

Notion's interaction model demonstrates how commands can become part of the editing workflow rather than a separate “AI theater” layer. citeturn567821search5

Linear similarly positions agents inside product workflows rather than treating them as a standalone novelty. citeturn567821search2

---

## 9. AI design quality bar

A premium AI interface should answer:

- What is the AI doing?
- Why is it doing it?
- What information is it using?
- What can the user change?
- What happens next?
- Can the user undo it?

The UI should communicate these through structure before explanatory paragraphs.
