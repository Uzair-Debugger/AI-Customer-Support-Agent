import HomeClient from "../components/HomeClient";
import { getSession } from "../lib/getSession";

export default async function Home() {
  const response = await getSession();
  const session = await response.json();
  return (
    <>
      <HomeClient user={{ name: session?.name ?? "" }} />
    </>
  );
}
