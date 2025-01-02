import dynamic from "next/dynamic";

const PhysicCanvas = dynamic(() => import("@/components/PhysicCanvas"), {
    ssr: false,
});

export default function Home() {
    return (
        <div className="relative h-full w-full">
            <PhysicCanvas />
        </div>
    );
}
