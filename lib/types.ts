export interface UserProfile {
    id: string;
    name: string | null;
    avatar: string | null;
    role?: string;
    // Extended profile fields
    bio?: string;
    location?: string;
    website?: string;
    coverImage?: string;
    links?: string;
    joinedAt?: string;
    lastActive?: Date | null;
    reputation?: number;
    badges?: any[];
    pinnedPostId?: string | null;
    isFollowing?: boolean;
    relationship?: any;
    stats?: {
        followers: number;
        following: number;
        posts: number;
    };
}

export interface Comment {
    id: string;
    content: string;
    createdAt: string | Date;
    userId: string;
    postId: string;
    parentId?: string | null;
    user: UserProfile;
    children?: Comment[];
    media?: string | null;
    isPinned?: boolean;
    isEdited?: boolean;
    isHidden?: boolean;
    deletedAt?: Date | null;
}

export interface Interaction {
    id: string;
    type: string;
    value: string | null;
    userId: string;
    postId?: string;
    commentId?: string;
}
