import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Subscriptions from "../components/Subscriptions";
import Benefits from "../components/Benefits";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Subscriptions />
      <Benefits />
      <Footer />
    </div>
  );
}
