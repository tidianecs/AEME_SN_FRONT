import keycloak from '../Keycloak';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${keycloak.token}`,
});

export const getAllUsers = async () => {
    const response = await fetch(`${API_URL}/admin/users`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erreur lors du chargement des utilisateurs');
    return response.json();
};

export const deleteUser = async (userId) => {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erreur lors de la suppression');
    return response.json();
};

export const inviteUser = async ({ email, firstName, lastName, role }) => {
    const response = await fetch(`${API_URL}/admin/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, firstName, lastName, role }),
    });
    if (!response.ok) throw new Error('Erreur lors de l\'invitation');
    return response.json();
};

export const getUserReports = async (userId) => {
    const response = await fetch(`${API_URL}/admin/users/${userId}/reports`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erreur lors du chargement des rapports');
    return response.json();
};

export const approveReport = async (id) => {
    const response = await fetch(`${API_URL}/admin/reports/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erreur lors de l\'approbation');
    return response.json();
};

export const deleteReportAdmin = async (id) => {
    const response = await fetch(`${API_URL}/admin/reports/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erreur lors de la suppression');
    return response.json();
};

export const updateMembership = async (userId, membershipService) => {
    const response = await fetch(`${API_URL}/admin/users/${userId}/membership`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ membershipService }),
    });
    if (!response.ok) throw new Error('Erreur lors de la mise à jour du membership');
    return response.json();
};