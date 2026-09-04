import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { WorkspaceMessage, WorkspaceContext, ModelTier } from '../ai/types';
import { ModelSelector } from '../ai/ModelSelector';
import { ContextChip } from '../ai/ContextChip';
import { ContextModal } from '../ai/ContextModal';
import { MessageList } from '../ai/MessageList';
import { Composer } from '../ai/Composer';
import { liveTutorApiClient } from '../../services/api.service';
import { Button } from '../ui/Button';

export interface LumoAIPageProps {
  idToken: string;
  onNavigate: (path: string) => void;
  initialTopic?: string;
  initialSubject?: string;
  initialConcept?: string;
  initialDocumentId?: string;
  initialDocumentTitle?: string;
  initialPrompt?: string;
  from?: string;
}

export const LumoAIPage: React.FC<LumoAIPageProps> = ({
  idToken,
  onNavigate,
  initialTopic,
  initialSubject,
  initialConcept,
  initialDocumentId,
  initialDocumentTitle,
  initialPrompt,
  from,
}) => {
  const [messages, setMessages] = useState<WorkspaceMessage[]>([]);
  const [modelTier, setModelTier] = useState<ModelTier>('light');
  const [context, setContext] = useState<WorkspaceContext>({
    subject: initialSubject || undefined,
    topic: initialTopic || undefined,
    concept: initialConcept || undefined,
    documentId: initialDocumentId || undefined,
    documentTitle: initialDocumentTitle || undefined,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [currentStreamText, setCurrentStreamText] = useState<string>('');
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);

  // Abort controller reference for cancelling generation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch document title if documentId is provided without title
  useEffect(() => {
    if (initialDocumentId && !initialDocumentTitle && idToken) {
      liveTutorApiClient
        .getDocument(idToken, initialDocumentId)
        .then((doc) => {
          if (doc?.filename) {
            setContext((prev) => ({
              ...prev,
              documentTitle: doc.filename,
            }));
          }
        })
        .catch(() => {
          // ignore non-fatal
        });
    }
  }, [initialDocumentId, initialDocumentTitle, idToken]);

  // Handle sending a message
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isGenerating) return;

      const userMsg: WorkspaceMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsGenerating(true);
      setGenerationStatus(
        context.documentId
          ? 'Reviewing document & formulating explanation…'
          : 'Formulating explanation…'
      );
      setCurrentStreamText('');

      try {
        const history = messages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        let streamedContent = '';
        let finalSuggestions: string[] = [];
        let finalModelName = '';

        const result = await liveTutorApiClient.streamAIChat(
          idToken,
          {
            message: text.trim(),
            history,
            modelTier,
            context: {
              subject: context.subject,
              topic: context.topic,
              concept: context.concept,
              documentId: context.documentId,
              documentTitle: context.documentTitle,
            },
          },
          (chunk) => {
            streamedContent += chunk;
            setCurrentStreamText(streamedContent);
          },
          (meta) => {
            if (meta.suggestions) finalSuggestions = meta.suggestions;
          }
        );

        if (result.suggestions && result.suggestions.length > 0) {
          finalSuggestions = result.suggestions;
        }
        if (result.model) {
          finalModelName = result.model;
        }

        const assistantMsg: WorkspaceMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: result.fullText || streamedContent,
          createdAt: Date.now(),
          modelTier,
          modelName: finalModelName,
          suggestions: finalSuggestions,
          hasDocumentContext: Boolean(context.documentId),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: any) {
        console.error('[LumoAIPage] Chat error:', err);
        const errorMsg: WorkspaceMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content:
            'I ran into a temporary hiccup while formulating that explanation. Please try asking again or switch to another model tier.',
          createdAt: Date.now(),
          modelTier,
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsGenerating(false);
        setCurrentStreamText('');
        setGenerationStatus('');
      }
    },
    [idToken, isGenerating, messages, modelTier, context]
  );

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (currentStreamText) {
      const partialMsg: WorkspaceMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: currentStreamText,
        createdAt: Date.now(),
        modelTier,
      };
      setMessages((prev) => [...prev, partialMsg]);
    }
    setIsGenerating(false);
    setCurrentStreamText('');
    setGenerationStatus('');
  };

  const handleClearChat = () => {
    setMessages([]);
    setCurrentStreamText('');
    setIsGenerating(false);
  };

  // Auto-send initial prompt if routed with one (e.g. from Assessment or Live Theater)
  const initialPromptSentRef = useRef(false);
  useEffect(() => {
    if (initialPrompt && !initialPromptSentRef.current && messages.length === 0 && !isGenerating) {
      initialPromptSentRef.current = true;
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt, handleSendMessage, messages.length, isGenerating]);

  const backDestination = from === 'theater' ? '/tutor' : from === 'practice' ? '/practice' : '/dashboard';
  const backLabel = from === 'theater' ? '← Back to Theater' : from === 'practice' ? '← Back to Practice' : '← Home';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 64px)', // Deduct standard Lumo navbar height
        background: 'var(--color-background)',
        overflow: 'hidden',
      }}
    >
      {/* Workspace Sub-Header / Control Strip */}
      <header
        style={{
          height: '52px',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-6)',
          gap: 'var(--space-4)',
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        {/* Left: Back Link & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            onClick={() => onNavigate(backDestination)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: 'var(--text-body-sm)',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'color var(--motion-fast) var(--ease-standard)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-orange)')}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = 'var(--color-text-secondary)')
            }
          >
            {backLabel}
          </button>

          <div
            style={{
              height: '16px',
              width: '1px',
              background: 'var(--color-border)',
            }}
          />

          <span
            style={{
              fontSize: 'var(--text-body)',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: 'var(--color-text-primary)',
            }}
          >
            Lumo AI
          </span>

          {/* Context Chip */}
          <ContextChip
            context={context}
            onChangeContext={() => setIsContextModalOpen(true)}
            onClearContext={() => setContext({})}
          />
        </div>

        {/* Right: Model Selector & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ModelSelector
            selectedTier={modelTier}
            onSelectTier={(t) => setModelTier(t)}
            disabled={isGenerating}
          />

          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              disabled={isGenerating}
              style={{
                fontSize: '12px',
                color: 'var(--color-text-muted)',
                padding: '4px 8px',
              }}
              title="Start a new conversation"
            >
              New chat
            </Button>
          )}
        </div>
      </header>

      {/* Main Conversation Feed */}
      <MessageList
        messages={messages}
        isGenerating={isGenerating}
        generationStatus={generationStatus}
        currentStreamText={currentStreamText}
        currentModelTier={modelTier}
        context={context}
        onSelectPrompt={(prompt) => handleSendMessage(prompt)}
        onOpenContextModal={() => setIsContextModalOpen(true)}
        onSelectSuggestion={(s) => handleSendMessage(s)}
      />

      {/* Composer Fixed at Bottom */}
      <Composer
        onSendMessage={handleSendMessage}
        onOpenContextModal={() => setIsContextModalOpen(true)}
        isGenerating={isGenerating}
        onCancelGeneration={handleCancelGeneration}
        context={context}
        placeholder={
          context.topic
            ? `Ask about ${context.concept || context.topic}…`
            : context.documentTitle
            ? `Ask questions about ${context.documentTitle}…`
            : 'Ask Lumo anything…'
        }
      />

      {/* Context Attachment Modal */}
      <ContextModal
        isOpen={isContextModalOpen}
        onClose={() => setIsContextModalOpen(false)}
        currentContext={context}
        onSaveContext={(newCtx) => setContext(newCtx)}
        idToken={idToken}
      />
    </div>
  );
};
