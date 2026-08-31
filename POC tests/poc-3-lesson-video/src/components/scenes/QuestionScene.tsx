import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Scene } from "../../schema/lessonPlanSchema";

export const QuestionScene: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const data = scene.questionData || {
    prompt: "If you double the force applied to an object, what happens to its acceleration?",
    options: ["A) Halved", "B) Doubled", "C) Stays same", "D) Becomes zero"],
    correctAnswer: "B) Doubled",
    explanation: "Since a is directly proportional to F (F = ma), doubling force doubles acceleration!",
  };

  const titleSpring = spring({ frame, fps, config: { damping: 12 } });
  const isAnswerRevealed = frame > 80;
  const revealSpring = spring({ frame: frame - 80, fps, config: { damping: 10 } });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        height: "100%",
        padding: "85px 80px 140px 80px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "#ec4899",
          color: "#ffffff",
          padding: "4px 14px",
          borderRadius: 6,
          fontSize: 16,
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        QUICK QUIZ
      </div>

      <h2
        style={{
          fontSize: 34,
          fontWeight: 800,
          color: "#ffffff",
          margin: "0 0 20px 0",
          textAlign: "center",
          maxWidth: 900,
          transform: `scale(${titleSpring})`,
        }}
      >
        {data.prompt}
      </h2>

      {data.options && data.options.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            width: "100%",
            maxWidth: 820,
            marginBottom: 20,
          }}
        >
          {data.options.map((opt, i) => {
            const isCorrect = isAnswerRevealed && opt.startsWith(data.correctAnswer.substring(0, 2));

            return (
              <div
                key={i}
                style={{
                  background: isCorrect
                    ? "linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.4))"
                    : "rgba(30, 41, 59, 0.8)",
                  border: isCorrect ? "2px solid #22c55e" : "1px solid rgba(148, 163, 184, 0.3)",
                  borderRadius: 12,
                  padding: "16px 20px",
                  fontSize: 22,
                  fontWeight: 600,
                  color: isCorrect ? "#86efac" : "#f1f5f9",
                  transition: "all 0.3s ease",
                  transform: isCorrect ? `scale(${interpolate(revealSpring, [0, 1], [1, 1.05])})` : "scale(1)",
                }}
              >
                {opt} {isCorrect && " ✅"}
              </div>
            );
          })}
        </div>
      )}

      {isAnswerRevealed && (
        <div
          style={{
            background: "rgba(15, 23, 42, 0.9)",
            border: "1.5px solid #22c55e",
            borderRadius: 12,
            padding: "14px 24px",
            color: "#cbd5e1",
            fontSize: 20,
            maxWidth: 820,
            textAlign: "center",
            transform: `scale(${revealSpring})`,
            opacity: revealSpring,
          }}
        >
          💡 <strong>Explanation:</strong> {data.explanation}
        </div>
      )}
    </div>
  );
};