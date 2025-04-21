import { axiosInstance } from "./index";
// GET
export const getAllMovies = async () => {
    try {
        const response = await axiosInstance.get("/api/movies/get-all-movies"); // Added leading slash
        return response.data;
    } catch (error) {
        console.error("Error while calling getAllMovies API: ", error);
        return {
            success: false,
            message: error.response?.data?.message || "Error fetching movies"
        };
    }
}

export const getMovieById = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/movies/get-movie/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error while calling getMovieById API: ", error);
        return {
            success: false,
            message: error.response?.data?.message || "Error fetching movie details"
        };
    }
};

// POST
export const addMovie = async (value) => {
    try {
        const response = await axiosInstance.post("/api/movies/add-movie", value); // Added leading slash
        return response.data;
    } catch (error) {
        console.error("Error while calling addMovie API: ", error); // Fixed error message
        return {
            success: false,
            message: error.response?.data?.message || "Error adding movie"
        };
    }
}

export const deleteMovie = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/movies/delete-movie", payload);
        return response.data;
    } catch (error) {
        console.error("Error while calling deleteMovie API: ", error);
        return {
            success: false,
            message: error.response?.data?.message || "Error deleting movie"
        };
    }
};

// PUT
export const updateMovie = async (value) => {
    try {
        const response = await axiosInstance.put("/api/movies/update-movie", value);
        return response.data;
    } catch (error) {
        console.error("Error while calling updateMovie API: ", error); // Fixed error message
        return {
            success: false,
            message: error.response?.data?.message || "Error updating movie"
        };
    }
}
