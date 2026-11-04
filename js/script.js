"use strict";

document.addEventListener("DOMContentLoaded", () => {

  /* =====================================================
     MENÚ PARA CELULAR
     ===================================================== */

  const botonMenu = document.getElementById("menu-toggle");
  const menuPrincipal = document.getElementById("menu-principal");

  if (botonMenu && menuPrincipal) {
    botonMenu.addEventListener("click", () => {
      const abierto = menuPrincipal.classList.toggle("abierto");

      botonMenu.setAttribute("aria-expanded", String(abierto));
      botonMenu.setAttribute(
        "aria-label",
        abierto ? "Cerrar menú" : "Abrir menú"
      );
    });

    menuPrincipal.querySelectorAll("a").forEach((enlace) => {
      enlace.addEventListener("click", () => {
        menuPrincipal.classList.remove("abierto");
        botonMenu.setAttribute("aria-expanded", "false");
        botonMenu.setAttribute("aria-label", "Abrir menú");

        menuPrincipal.querySelectorAll("a").forEach((item) => {
          item.removeAttribute("aria-current");
        });

        enlace.setAttribute("aria-current", "page");
      });
    });

    document.addEventListener("click", (evento) => {
      if (
        menuPrincipal.classList.contains("abierto") &&
        !menuPrincipal.contains(evento.target) &&
        !botonMenu.contains(evento.target)
      ) {
        menuPrincipal.classList.remove("abierto");
        botonMenu.setAttribute("aria-expanded", "false");
        botonMenu.setAttribute("aria-label", "Abrir menú");
      }
    });

    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape") {
        menuPrincipal.classList.remove("abierto");
        botonMenu.setAttribute("aria-expanded", "false");
        botonMenu.setAttribute("aria-label", "Abrir menú");
      }
    });
  }


  /* =====================================================
     BOTÓN VOLVER ARRIBA
     ===================================================== */

  const botonArriba = document.getElementById("volver-arriba");

  if (botonArriba) {
    const actualizarBotonArriba = () => {
      botonArriba.classList.toggle("visible", window.scrollY > 350);
    };

    window.addEventListener("scroll", actualizarBotonArriba);
    actualizarBotonArriba();

    botonArriba.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth"
      });
    });
  }


  /* =====================================================
     AÑO ACTUAL
     ===================================================== */

  const anio = document.getElementById("anio-actual");

  if (anio) {
    anio.textContent = new Date().getFullYear();
  }


  /* =====================================================
     REPRODUCTORES MULTIMEDIA
     Mantener un solo audio o video reproduciéndose
     ===================================================== */

  const reproductores = document.querySelectorAll("audio, video");

  reproductores.forEach((reproductor) => {
    reproductor.addEventListener("play", () => {
      reproductores.forEach((otroReproductor) => {
        if (otroReproductor !== reproductor && !otroReproductor.paused) {
          otroReproductor.pause();
        }
      });
    });
  });


  /* =====================================================
     DIRECTORIO DE DOCENTES
     Carga los datos compartidos del directorio docente.
     Buscar por nombre, área, materia, semestre o títulos.
     ===================================================== */

  const buscador = document.getElementById("buscar-docente");
  const botonLimpiar = document.getElementById("limpiar-busqueda");
  const listaDocentes = document.getElementById("lista-docentes");
  const contadorDocentes = document.getElementById("contador-docentes");

  const filtrosDocentes = [
    {
      elemento: document.getElementById("filtro-area"),
      campo: "area"
    },
    {
      elemento: document.getElementById("filtro-materia"),
      campo: "materias"
    },
    {
      elemento: document.getElementById("filtro-semestre"),
      campo: "semestres"
    },
    {
      elemento: document.getElementById("filtro-titulo"),
      campo: "formacion"
    }
  ].filter((filtro) => filtro.elemento);

  if (listaDocentes) {

    let docentes = [];

    try {
      const datosDocentes = document.getElementById("datos-docentes");

      if (!datosDocentes) {
        throw new Error("No se encontró el JSON de docentes en index.html.");
      }

      docentes = JSON.parse(datosDocentes.textContent);

      if (!Array.isArray(docentes)) {
        throw new Error("Los datos de docentes no tienen el formato esperado.");
      }

      const ordenarNombres = new Intl.Collator("es", {
        numeric: true,
        sensitivity: "base"
      });
      docentes.sort((docenteA, docenteB) =>
        ordenarNombres.compare(docenteA.nombre, docenteB.nombre)
      );

    } catch (error) {
      console.error(
        "No se pudieron leer los datos compartidos del directorio docente.",
        error
      );

      if (contadorDocentes) {
        contadorDocentes.textContent =
          "No se pudo cargar el directorio. Revisa los datos de docentes en index.html.";
      }

      return;
    }


    /* ESCAPAR CARACTERES ESPECIALES */

    const escaparHTML = (texto) => {
      return String(texto || "Información no disponible").replace(
        /[&<>"']/g,
        (caracter) => {
          const equivalencias = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
          };

          return equivalencias[caracter];
        }
      );
    };


    /* NORMALIZAR TEXTO PARA LAS BÚSQUEDAS */

    const normalizar = (texto) => {
      return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("es")
        .trim();
    };


    /* CARGAR OPCIONES DE LOS FILTROS */

    filtrosDocentes.forEach(({ elemento, campo }) => {
      const valores = [
        ...new Set(
          docentes
            .map((docente) => docente[campo])
            .filter((valor) => valor)
        )
      ].sort();

      valores.forEach((valor) => {
        const opcion = document.createElement("option");

        opcion.value = valor;
        opcion.textContent = valor;

        elemento.appendChild(opcion);
      });
    });


    /* MOSTRAR LAS TARJETAS DE DOCENTES */

    const mostrarDocentes = (lista) => {

      listaDocentes.replaceChildren();

      if (contadorDocentes) {
        contadorDocentes.textContent =
          `Se muestran ${lista.length} de ${docentes.length} docentes.`;
      }

      if (lista.length === 0) {
        const mensaje = document.createElement("p");

        mensaje.className = "sin-resultados";
        mensaje.textContent =
          "No hay coincidencias. Prueba con otro nombre o cambia los filtros.";

        listaDocentes.appendChild(mensaje);
        return;
      }

      const fragmento = document.createDocumentFragment();

      lista.forEach((docente) => {

        const tarjeta = document.createElement("article");
        tarjeta.className = "docente-card";


        /* FOTO DEL DOCENTE */

        const avatar = document.createElement("div");
        avatar.className = "docente-avatar";

        const imagen = document.createElement("img");

        imagen.alt = `Fotografía de ${docente.nombre}`;
        imagen.loading = "eager";
        imagen.decoding = "async";

        if (docente.foto) {
          imagen.src = docente.foto;
        } else {
          imagen.hidden = true;
        }


        /* IMAGEN GENÉRICA SI NO HAY FOTOGRAFÍA */

        const avatarGenerico = document.createElement("span");

        avatarGenerico.className = "docente-avatar-generico";
        avatarGenerico.setAttribute("aria-hidden", "true");
        avatarGenerico.hidden = Boolean(docente.foto);

        avatarGenerico.innerHTML = `
          <svg viewBox="0 0 48 48" focusable="false">
            <circle cx="24" cy="16" r="9"></circle>
            <path d="M7 43c1-10 7-16 17-16s16 6 17 16"></path>
          </svg>
          <small>Foto del docente</small>
        `;

        imagen.addEventListener("error", () => {
          imagen.hidden = true;
          avatarGenerico.hidden = false;
        }, { once: true });

        avatar.append(imagen, avatarGenerico);


        /* NÚMERO DE DOCENTE */

        const numero = document.createElement("span");

        numero.className = "docente-numero";
        numero.textContent = String(
          docentes.indexOf(docente) + 1
        ).padStart(2, "0");

        avatar.appendChild(numero);


        /* INFORMACIÓN COMPLETA */

        const informacion = document.createElement("div");

        informacion.className = "docente-info";

        informacion.innerHTML = `
          <dl>
            <div>
              <dt>Nombre completo:</dt>
              <dd>${escaparHTML(docente.nombre)}</dd>
            </div>

            <div>
              <dt>Área académica:</dt>
              <dd>${escaparHTML(docente.area)}</dd>
            </div>

            <div>
              <dt>Materias y módulos:</dt>
              <dd>${escaparHTML(docente.materias)}</dd>
            </div>

            <div>
              <dt>Semestres:</dt>
              <dd>${escaparHTML(docente.semestres)}</dd>
            </div>

            <div>
              <dt>Especialidad y formación académica:</dt>
              <dd>${escaparHTML(docente.formacion)}</dd>
            </div>

            ${
              docente.adicionales &&
              docente.adicionales !== "Información no disponible"
                ? `
                  <div>
                    <dt>Clubes y responsabilidades:</dt>
                    <dd>${escaparHTML(docente.adicionales)}</dd>
                  </div>
                `
                : ""
            }
          </dl>
        `;

        tarjeta.append(avatar, informacion);
        fragmento.appendChild(tarjeta);
      });

      listaDocentes.appendChild(fragmento);
    };


    /* BUSCADOR Y FILTROS */

    const buscarDocentes = () => {

      const texto = normalizar(buscador?.value);

      const resultados = docentes.filter((docente) => {

        const informacionCompleta = Object.values(docente).join(" ");

        const textoCoincide = normalizar(
          informacionCompleta
        ).includes(texto);

        const filtrosCoinciden = filtrosDocentes.every(
          ({ elemento, campo }) => {
            return !elemento.value ||
              docente[campo] === elemento.value;
          }
        );

        return textoCoincide && filtrosCoinciden;
      });

      mostrarDocentes(resultados);
    };


    /* ACTIVAR BUSCADOR */

    if (buscador) {
      buscador.addEventListener("input", buscarDocentes);
    }


    /* ACTIVAR FILTROS */

    filtrosDocentes.forEach(({ elemento }) => {
      elemento.addEventListener("change", buscarDocentes);
    });


    /* LIMPIAR BÚSQUEDA */

    if (botonLimpiar) {
      botonLimpiar.addEventListener("click", () => {

        const formulario = document.getElementById("filtros-docentes");

        if (formulario) {
          formulario.reset();
        }

        buscarDocentes();

        if (buscador) {
          buscador.focus();
        }
      });
    }


    /* MOSTRAR TODOS LOS DOCENTES AL INICIAR */

    mostrarDocentes(docentes);
  }


  /* =====================================================
     ENLACES INTERNOS Y DESPLAZAMIENTO SUAVE
     ===================================================== */

  document.querySelectorAll('a[href^="#"]').forEach((enlace) => {

    enlace.addEventListener("click", (evento) => {

      const destinoId = enlace.getAttribute("href");

      if (!destinoId || destinoId === "#") {
        return;
      }

      const destino = document.querySelector(destinoId);

      if (destino) {

        evento.preventDefault();

        destino.scrollIntoView({
          behavior: window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches
            ? "auto"
            : "smooth",

          block: "start"
        });
      }
    });
  });

});
fetch("./datos/docentes.json")
  .then(response => {
    if (!response.ok) {
      throw new Error("No se pudo cargar el archivo JSON");
    }
    return response.json();
  })
  .then(docentes => {
    console.log("Docentes cargados:", docentes);
  })
  .catch(error => {
    console.error("Error:", error);
  });