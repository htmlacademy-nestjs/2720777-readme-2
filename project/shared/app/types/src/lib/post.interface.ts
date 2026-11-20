export enum PostStatus {
  Draft = 'draft',
  Published = 'published',
}

export enum PostType {
  Text = 'text',
  Video = 'video',
  Quote = 'quote',
  Photo = 'photo',
  Link = 'link',
}

export interface Post {
  id: string;
  type: PostType;
  status: PostStatus;
  title?: string;
  content?: string;
  announce?: string;
  videoUrl?: string;
  quoteText?: string;
  quoteAuthor?: string;
  imageUrl?: string;
  linkUrl?: string;
  linkDescription?: string;
  tags: string[];
  isRepost: boolean;
  originalPostId?: string;
  originalAuthorId?: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}
