export const getAllAssets = async () => {
    const response = await fetch('/api/fabric/assets');
    return response.json();
}