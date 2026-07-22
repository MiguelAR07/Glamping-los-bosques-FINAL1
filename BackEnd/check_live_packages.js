async function getPackages() {
  const res = await fetch('https://backend-landing-x76z.onrender.com/api/packages/getall');
  const data = await res.json();
  console.log(data);
}

getPackages();
