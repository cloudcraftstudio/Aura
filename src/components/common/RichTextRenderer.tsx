import React from 'react';
import { ExternalLink } from 'lucide-react';
import { parseRichText, extractVideosFromText } from '../../utils/mediaUtils';
import { VideoEmbed } from './VideoEmbed';

interface RichTextRendererProps {
  content: string;
  className?: string;
  showVideoEmbeds?: boolean;
  onTagClick?: (tag: string) => void;
  onMentionClick?: (mention: string) => void;
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({
  content,
  className = '',
  showVideoEmbeds = true,
  onTagClick,
  onMentionClick,
}) => {
  if (!content) return null;

  const tokens = parseRichText(content);
  const videos = showVideoEmbeds ? extractVideosFromText(content) : [];

  return (
    <div className="space-y-3">
      {/* Formatted Text Content with clickable links */}
      <p className={`whitespace-pre-line leading-relaxed break-words ${className}`}>
        {tokens.map((token, idx) => {
          if (token.type === 'link' && token.url) {
            return (
              <a
                key={idx}
                href={token.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline underline-offset-2 font-medium transition-colors break-all"
                title={`Open link: ${token.url}`}
              >
                <span>{token.value}</span>
                <ExternalLink className="w-3 h-3 inline-block shrink-0" />
              </a>
            );
          }

          if (token.type === 'hashtag') {
            return (
              <span
                key={idx}
                onClick={(e) => {
                  if (onTagClick) {
                    e.stopPropagation();
                    onTagClick(token.value.replace(/^#/, ''));
                  }
                }}
                className={`text-cyan-400 hover:text-cyan-300 font-semibold ${
                  onTagClick ? 'cursor-pointer hover:underline' : ''
                }`}
              >
                {token.value}
              </span>
            );
          }

          if (token.type === 'mention') {
            return (
              <span
                key={idx}
                onClick={(e) => {
                  if (onMentionClick) {
                    e.stopPropagation();
                    onMentionClick(token.value.replace(/^@/, ''));
                  }
                }}
                className={`text-indigo-400 hover:text-indigo-300 font-semibold ${
                  onMentionClick ? 'cursor-pointer hover:underline' : ''
                }`}
              >
                {token.value}
              </span>
            );
          }

          return <span key={idx}>{token.value}</span>;
        })}
      </p>

      {/* Embedded Video Players */}
      {showVideoEmbeds && videos.length > 0 && (
        <div className="space-y-3 pt-1">
          {videos.map((video, vIdx) => (
            <VideoEmbed key={video.url + vIdx} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};
