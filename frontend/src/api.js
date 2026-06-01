import axios from 'axios'

const BASE_URL = 'https://heroclash-backend.onrender.com'

export const fetchDeck = async () => {
  const response = await axios.get(`${BASE_URL}/api/heroes/deck`)
  return response.data.cards
}

export const saveGame = async (result) => {
  const response = await axios.post(`${BASE_URL}/api/game/save`, result)
  return response.data
}