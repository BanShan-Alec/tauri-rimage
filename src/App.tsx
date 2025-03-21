import "./App.css";
import { ImageCompressor } from "./components/ImageCompressor/index";
import { Toaster } from "sonner";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="py-6">
        <ImageCompressor />
        <Toaster duration={2000} />
      </div>
    </div>
  );
}

export default App;
