import React, { useEffect } from "react";


import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Jumbotron } from "../components/Jumbotron.jsx";
import Card from "../components/Card.jsx";
import { Instrucciones } from "../components/Instrucciones.jsx";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";


const imageUrl1 = "src/front/assets/img/regalo.jpg";
const button = "¡Ver producto!";

export const Home = () => {

	// --- LÓGICA Y ESTADO ---
	const { store, dispatch } = useGlobalReducer();

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
	}, []);

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

				{/* Configuración del Swiper */}
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
					className="mySwiper px-2"
				>

					{/* --- SLIDES INDIVIDUALES --- */}

					<SwiperSlide className="d-flex justify-content-center">
						<Card
							imageUrl={imageUrl1}
							title="Título imagen"
							description="Descripción del producto..."
							button={button}
						/>
					</SwiperSlide>

					<SwiperSlide className="d-flex justify-content-center">
						<Card
							imageUrl={imageUrl1}
							title="Título imagen"
							description="Descripción del producto..."
							button={button}
						/>
					</SwiperSlide>

					<SwiperSlide className="d-flex justify-content-center">
						<Card
							imageUrl={imageUrl1}
							title="Título imagen"
							description="Descripción del producto..."
							button={button}
						/>
					</SwiperSlide>

					<SwiperSlide className="d-flex justify-content-center">
						<Card
							imageUrl={imageUrl1}
							title="Título imagen"
							description="Descripción del producto..."
							button={button}
						/>
					</SwiperSlide>

				</Swiper>
			</div>
		</div>
	);
};