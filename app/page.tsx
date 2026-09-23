import { BuyerDashboard } from "@/components/buyer-dashboard";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: todos, error } = await supabase.from("todos").select("id, name");

  return (
    <>
      <BuyerDashboard />
      <section className="content" aria-labelledby="todos-heading">
        <h2 id="todos-heading">Tareas</h2>
        {error ? (
          <p role="alert">No se pudieron cargar las tareas. Inténtalo de nuevo más tarde.</p>
        ) : todos?.length ? (
          <ul>
            {todos.map((todo) => (
              <li key={todo.id}>{todo.name}</li>
            ))}
          </ul>
        ) : (
          <p>No hay tareas disponibles.</p>
        )}
      </section>
    </>
  );
}
