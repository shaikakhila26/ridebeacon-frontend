export default function Hero() {
  return (
   <section 
  id="home" 
  className="relative min-h-screen flex flex-col md:flex-row items-center justify-between px-6 pt-24 bg-yellow-400 bg-no-repeat bg-contain bg-right"
  style={{ backgroundImage: `url(/homebg5.jpeg)` }}
>
  <div className="md:w-1/2 space-y-6 z-10 text-black">
    <h1 className="text-5xl font-bold leading-tight">Need a Ride</h1>
    <div className="flex gap-4">
      <button className="bg-black text-yellow-400 px-6 py-3 rounded-full font-semibold">Book Now</button>
    </div>
  </div>
</section>


  );
}