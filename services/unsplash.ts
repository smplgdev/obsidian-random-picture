import axios from "axios"

async function fetchRandomImage(unsplashAccessKey: string): Promise<any> {
	const API_ENDPOINT: string = "https://api.unsplash.com"
	const response = await axios.get(`${API_ENDPOINT}/photos/random`, {
		headers: {
			Authorization: `Client-ID ${unsplashAccessKey}`,
			'Accept-Version': 'v1'
		}
	})
	return {url: response.data.urls.full, author: response.data.user};
}

export default fetchRandomImage
