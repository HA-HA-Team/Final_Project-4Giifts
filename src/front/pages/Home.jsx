import React, { useEffect, useState } from "react";


import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Jumbotron } from "../components/Jumbotron.jsx";
import Card from "../components/Card.jsx";
import { Instrucciones } from "../components/Instrucciones.jsx";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";
import { json } from "react-router-dom";


const imageUrl1 = "src/front/assets/img/regalo.jpg";
const button = "Comprar";

export const Home = () => {

	// --- LÓGICA Y ESTADO ---
	const { store, dispatch } = useGlobalReducer();
	const [favoriteUser, setFavoriteUser] = useState([]);
	const loadMessage = async () => {
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL;

			if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file");

			const response = await fetch(backendUrl + "/api/hello");
			const data = await response.json();

			if (response.ok) dispatch({ type: "set_hello", payload: data.message });

			return data;

		} catch (error) {
			if (error.message) throw new Error(
				`Could not fetch the message from the backend.
                Please check if the backend is running and the backend port is public.`
			);
		}
	};

	useEffect(() => {
		loadMessage();
		loadFavoriteUser();
	}, []);

	const loadFavoriteUser = async () => {
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL;

			if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file");

			const response = await fetch(backendUrl + "/api/get_favorite_user");
			const data = await response.json();

			console.log("DATA FAVORITE USER:", typeof data);

			setFavoriteUser(data);

		} catch (error) {

		}
	};

	return (
		<div className="w-100">

			{/* SECCIÓN SUPERIOR: Jumbotron e Instrucciones */}
			<Jumbotron />
			<Instrucciones />

			{/* SECCIÓN DEL CARRUSEL DE REGALOS */}
			<div className="container my-5">

				<h3 className="text-center fw-bold mb-4">
					Otros usuarios han seleccionado estos regalos como favorito...
				</h3>
				
				<Swiper

					modules={[Autoplay]}
					autoplay={{ delay: 3000, disableOnInteraction: false }}
					spaceBetween={30}
					slidesPerView={1}
					loop={true}
					breakpoints={{
						768: { slidesPerView: 2 },
						1024: { slidesPerView: 3 }
					}}
					className="mySwiper px-2">

					{/* --- SLIDES INDIVIDUALES --- */}

					{
						favoriteUser.length > 0 ? (
							favoriteUser.map((fav, index) => (
								<SwiperSlide key={index} className="d-flex justify-content-center h-auto my-1">
									<Card
										imageUrl={fav.img}
										title={fav.name}
										description={`Precio: ${fav.price}`}
										button={button}
										linkButton= {fav.link}
									/>
								</SwiperSlide>
							))

						) : <SwiperSlide className="d-flex justify-content-center h-auto my-1">
									<Card
										imageUrl='https://images.unsplash.com/photo-1599623560574-39d485900c95?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dG95c3xlbnwwfHwwfHx8MA%3D%3D'
										title='Los mejores juguetes'
										description='€€€'
										button={button}
									/>
								</SwiperSlide>
					}

				</Swiper>
			</div>
		</div>
	);
};