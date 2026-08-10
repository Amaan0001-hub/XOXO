import './globals.css' 

export default function RootLayout({ children }) {
  return (
    <> 
      <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
      <link rel="stylesheet" href="/assets/css/fontawesome.min.css" />
      <link rel="stylesheet" href="/assets/css/magnific-popup.min.css" />
      <link rel="stylesheet" href="/assets/css/swiper-bundle.min.css" />
      <link rel="stylesheet" href="/assets/css/style.css" /> 
      {children} 
    </>
  )
}

