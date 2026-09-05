import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { WorkspaceMessage, WorkspaceContext, ModelTier } from '../ai/types';
import { ContextChip } from '../ai/ContextChip';
import { ContextModal } from '../ai/ContextModal';
import { MessageList } from '../ai/MessageList';
import { Composer } from '../ai/Composer';
import { liveTutorApiClient } from '../../services/api.service';
import { Button } from '../ui/Button';

export interface LumoAIPageProps {
  idToken: string;
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
  initialTopic,
  initialSubject,
  initialConcept,
  initialDocumentId,
  initialDocumentTitle,
  initialPrompt,
  from: _from,
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
  const streamedContentRef = useRef('');
  const rafRef = useRef<number | null>(null);

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
      streamedContentRef.current = '';
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      try {
        const history = messages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        }));

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
            streamedContentRef.current += chunk;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => {
              setCurrentStreamText(streamedContentRef.current);
              rafRef.current = null;
            });
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
          content: result.fullText || streamedContentRef.current,
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
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        setIsGenerating(false);
        setCurrentStreamText('');
        setGenerationStatus('');
        streamedContentRef.current = '';
      }
    },
    [idToken, isGenerating, messages, modelTier, context]
  );

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
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
    streamedContentRef.current = '';
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

      {/* Composer area — includes New Chat + Context row above input when there are messages */}
      <div style={{ flexShrink: 0 }}>
        {messages.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px var(--space-4) 0 var(--space-4)',
              maxWidth: '800px',
              width: '100%',
              margin: '0 auto',
            }}
          >
            <ContextChip
              context={context}
              onChangeContext={() => setIsContextModalOpen(true)}
              onClearContext={() => setContext({})}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              disabled={isGenerating}
              style={{
                fontSize: '12px',
                color: 'var(--color-text-muted)',
                height: '28px',
                padding: '0 10px',
              }}
              title="Start a new conversation"
            >
              New chat
            </Button>
          </div>
        )}

        <Composer
          onSendMessage={handleSendMessage}
          onOpenContextModal={() => setIsContextModalOpen(true)}
          isGenerating={isGenerating}
          onCancelGeneration={handleCancelGeneration}
          context={context}
          modelTier={modelTier}
          onSelectTier={(t) => setModelTier(t)}
          placeholder={
            context.topic
              ? `Ask about ${context.concept || context.topic}…`
              : context.documentTitle
              ? `Ask questions about ${context.documentTitle}…`
              : 'Ask Lumo anything…'
          }
        />
      </div>

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
