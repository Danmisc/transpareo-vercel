
export const SearchHistoryService = {
    addRecentView: (view: { id: string; name: string; avatar?: string; role: string }) => {
        try {
            const history = localStorage.getItem("recent_views");
            let views = history ? JSON.parse(history) : [];

            // Remove duplicates
            views = views.filter((v: any) => v.id !== view.id);

            // Add to top
            views.unshift(view);

            // Limit to 5
            if (views.length > 5) views.pop();

            localStorage.setItem("recent_views", JSON.stringify(views));
        } catch (e) {
            console.error("Failed to save view history", e);
        }
    },

    getRecentViews: () => {
        try {
            const history = localStorage.getItem("recent_views");
            return history ? JSON.parse(history) : [];
        } catch (e) {
            return [];
        }
    }
};
