const Skeleton = () => {
    return (
        <div
            className="animate-pulse flex flex-col items-center gap-4 w-60 mx-auto mt-20"
            role="status"
            aria-label="Cargando contenido"
        >
            {/* Título y subtítulo */}
            <div className="space-y-3 w-full">
                <div className="h-6 bg-slate-400 rounded-md w-3/4 mx-auto" />
                <div className="h-4 bg-slate-400 rounded-md w-1/2 mx-auto" />
            </div>

            {/* Cuerpo de opciones */}
            <div className="space-y-2 w-full">
                <div className="h-7 bg-slate-400 rounded-md w-full" />
                <div className="h-7 bg-slate-400 rounded-md w-full" />
                <div className="h-7 bg-slate-400 rounded-md w-full" />
                <div className="h-7 bg-slate-400 rounded-md w-1/2 mx-auto" />
            </div>
        </div>
    );
};

export default Skeleton;
