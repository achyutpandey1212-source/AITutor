import React from 'react';
import { Hero } from '../landing/Hero';
import { TeachingLoop } from '../landing/TeachingLoop';
import { NotAnotherChatbot } from '../landing/NotAnotherChatbot';
import { SubjectShowcase } from '../landing/SubjectShowcase';
import { MaterialSection } from '../landing/MaterialSection';
import { TheaterPreview } from '../landing/TheaterPreview';
import { FinalCTA } from '../landing/FinalCTA';
import { Footer } from '../landing/Footer';

export interface LandingPageProps {
  isAuthenticated: boolean;
  onNavigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ isAuthenticated, onNavigate }) => {
  const handleStartLearning = () => {
    if (isAuthenticated) {
      onNavigate('/tutor');
    } else {
      onNavigate('/signup');
    }
  };

  const handleExplore = () => {
    const el = document.getElementById('how');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      style={{
        background: 'var(--color-background)',
        color: 'var(--color-text-primary)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 01. Hero Section */}
      <Hero onStart={handleStartLearning} onExplore={handleExplore} />

      {/* 02. Teaching Loop Demonstration */}
      <TeachingLoop />

      {/* 03. Cognitive Contrast (Not Another Chatbot) */}
      <NotAnotherChatbot />

      {/* 04. Subject-Aware Visual Intelligence */}
      <SubjectShowcase />

      {/* 05. Bring Your Material (Document & RAG Intelligence) */}
      <MaterialSection onStart={handleStartLearning} />

      {/* 06. The Flagship Learning Theater Preview */}
      <TheaterPreview onEnterTheater={handleStartLearning} />

      {/* 07. Final Quiet Invitation */}
      <FinalCTA onStart={handleStartLearning} />

      {/* 08. Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};
