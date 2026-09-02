import React, { useState } from 'react';
import type {
  AssessmentDifficulty,
  AssessmentEvaluationMode,
  AssessmentGoal,
  AssessmentQuestionType,
  AssessmentSubmission,
  ClientAssessmentQuestion,
} from '@ai-tutor/shared';
import { liveTutorApiClient } from '../../services/api.service';
import { AssessmentRenderer } from './AssessmentRenderer';

export interface AssessmentPracticeScreenProps {
  idToken: string | null;
  readyDocsCount?: number;
}

export const AssessmentPracticeScreen: React.FC<AssessmentPracticeScreenProps> = ({
  idToken,
  readyDocsCount = 0,
}) => {
  const [subject, setSubject] = useState<string>('Mathematics');
  const [concept, setConcept] = useState<string>('Linear Equations in One Variable');
  const [grade, setGrade] = useState<string>('Class 8');
  const [goal, setGoal] = useState<AssessmentGoal>('practice');
  const [preferredDifficulty, setPreferredDifficulty] = useState<string>('auto');
  const [preferredQuestionType, setPreferredQuestionType] = useState<string>('auto');
  const [targetMarks, setTargetMarks] = useState<string>('auto');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<ClientAssessmentQuestion | null>(null);
  const [latestSubmission, setLatestSubmission] = useState<AssessmentSubmission | null>(null);

  const handleGenerateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idToken) {
      setError('Please sign in first to generate practice questions.');
      return;
    }
    if (!concept.trim() || !subject.trim()) {
      setError('Subject and concept are required.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentQuestion(null);
    setLatestSubmission(null);

    try {
      const marksNum = targetMarks !== 'auto' ? parseInt(targetMarks, 10) : undefined;
      const diffEnum = preferredDifficulty !== 'auto' ? (preferredDifficulty as AssessmentDifficulty) : undefined;
      const qTypeEnum = preferredQuestionType !== 'auto' ? (preferredQuestionType as AssessmentQuestionType) : undefined;
      const evalModeEnum =
        qTypeEnum === 'IMAGE_SOLUTION'
          ? ('IMAGE_SOLUTION' as AssessmentEvaluationMode)
          : qTypeEnum === 'NUMERICAL' && marksNum && marksNum >= 3
          ? ('IMAGE_SOLUTION' as AssessmentEvaluationMode)
          : undefined;

      const question = await liveTutorApiClient.generateAssessmentQuestion(idToken, {
        concept: concept.trim(),
        subject: subject.trim(),
        grade: grade.trim() || undefined,
        goal,
        difficulty: diffEnum,
        questionType: qTypeEnum,
        evaluationMode: evalModeEnum,
        marks: marksNum,
      });

      setCurrentQuestion(question);
    } catch (err: any) {
      console.error('Error generating assessment question:', err);
      setError(err?.message || 'Failed to generate assessment question.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitted = (submission: AssessmentSubmission) => {
    setLatestSubmission(submission);
  };

  return (
    <section
      style={{
        marginTop: '1.5rem',
        padding: '1.5rem',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        background: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#0f172a' }}>
          📝 Adaptive Assessment & Practice Engine
        </h2>
        {readyDocsCount > 0 && (
          <span
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '999px',
              background: '#dcfce7',
              color: '#166534',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            📚 RAG Grounding Active ({readyDocsCount} study docs)
          </span>
        )}
      </div>

      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        Generate curriculum-aligned adaptive assessment questions (MCQ, Short Answer, Long Answer, Numerical, and Handwritten Image Solutions) grounded in your study materials.
      </p>

      {/* Control Panel / Form */}
      <form
        onSubmit={handleGenerateQuestion}
        style={{
          background: '#f8fafc',
          padding: '1.25rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {/* Subject */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Subject:
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science (General)</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="English">English Literature & Grammar</option>
              <option value="Social Studies">Social Studies / History / Civics</option>
            </select>
          </div>

          {/* Grade */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Grade / Class:
            </label>
            <input
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="e.g. Class 8, Grade 10"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>

          {/* Goal */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Assessment Goal:
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as AssessmentGoal)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="concept_check">Concept Check (1 Question)</option>
              <option value="practice">Targeted Practice</option>
              <option value="diagnostic">Diagnostic Assessment</option>
              <option value="mastery_verification">Mastery Verification</option>
            </select>
          </div>
        </div>

        {/* Concept Input */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
            Concept / Chapter Topic:
          </label>
          <input
            type="text"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="e.g. Linear Equations in One Variable, Photosynthesis, French Revolution Causes"
            required
            style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        {/* Advanced / Optional Overrides */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>
              Difficulty:
            </label>
            <select
              value={preferredDifficulty}
              onChange={(e) => setPreferredDifficulty(e.target.value)}
              style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            >
              <option value="auto">Auto (Adaptive)</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>
              Question Type:
            </label>
            <select
              value={preferredQuestionType}
              onChange={(e) => setPreferredQuestionType(e.target.value)}
              style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            >
              <option value="auto">Auto (Subject-Aware)</option>
              <option value="MCQ">MCQ</option>
              <option value="SHORT_ANSWER">Short Answer</option>
              <option value="LONG_ANSWER">Long Answer</option>
              <option value="NUMERICAL">Numerical</option>
              <option value="IMAGE_SOLUTION">Image Solution (Handwritten)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>
              Marks Target:
            </label>
            <select
              value={targetMarks}
              onChange={(e) => setTargetMarks(e.target.value)}
              style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            >
              <option value="auto">Auto</option>
              <option value="1">1 Mark</option>
              <option value="2">2 Marks</option>
              <option value="3">3 Marks</option>
              <option value="5">5 Marks (e.g. Image Solution)</option>
              <option value="10">10 Marks (Substantial Problem)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !idToken}
          style={{
            padding: '0.65rem 1.5rem',
            background: isLoading || !idToken ? '#94a3b8' : '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: isLoading || !idToken ? 'not-allowed' : 'pointer',
            fontSize: '0.95rem',
          }}
        >
          {isLoading ? 'Generating Question with AI...' : '🎯 Generate Question'}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: '6px',
            fontSize: '0.9rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Render Generated Question */}
      {currentQuestion && idToken && (
        <div>
          <AssessmentRenderer
            question={currentQuestion}
            idToken={idToken}
            onSubmitted={handleSubmitted}
            initialSubmission={latestSubmission}
          />

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleGenerateQuestion}
              disabled={isLoading}
              style={{
                padding: '0.5rem 1rem',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                color: '#334155',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              🔄 Generate Another Question
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
