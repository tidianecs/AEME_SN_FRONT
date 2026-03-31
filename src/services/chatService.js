import keycloak from "../Keycloak";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${keycloak.token}`,
});

export const getOrCreateConversation = async (otherUserId) => {
    const response = await fetch(`${API_URL}/chat/conversations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ otherUserId }),
    });
    if (!response.ok) throw new Error('Erreur lors de la création de la conversation');
    return response.json();
};

export const getMyConversations = async () => {
    const response = await fetch(`${API_URL}/chat/conversations`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erreur lors du chargement des conversations');
    return response.json();
};

export const getMessages = async (conversationId) => {
    const response = await fetch(`${API_URL}/chat/conversations/${conversationId}/messages`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erreur lors du chargement des messages');
    return response.json();
};

export const deleteConversation = async (id) => {
    const response = await fetch(`${API_URL}/chat/conversations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erreur lors de la suppression');
    return response.json();
};

export const getUserById = async (userId) => {
    const response = await fetch(`${API_URL}/auth/users/${userId}`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) return { fullName: 'Utilisateur' };
    return response.json();
};