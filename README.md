# Pokedex - Angular 20

## 📝 Descripción del proyecto

Este proyecto es una **Pokedex** desarrollada en **Angular 20**, diseñada como una demostración práctica de mis habilidades técnicas en el framework. Su principal objetivo es la interacción eficiente y asíncrona con servicios externos. Para ello, consume la API pública **[PokeAPI](https://pokeapi.co/)**, extrayendo datos de Pokémon para presentarlos de forma clara y accesible. El desarrollo se ha enfocado en la **gestión datos asíncronos** y una **estructura modular de componentes**, asegurando escalabilidad y mantenibilidad en la aplicación.

---

## 🛠️ Instrucciones de instalación y ejecución

Estas instrucciones te guiarán para poner en marcha una copia local del proyecto para propósitos de desarrollo y pruebas.

### Requisitos previos

Asegúrate de tener instalado **Node.js** y el **CLI de Angular 20** en tu sistema.

**Instalar Node.js**

1.  Dirígete al sitio web oficial de Node.js: **[https://nodejs.org/](https://nodejs.org/)**.
2.  Descarga e instala la versión **LTS**.
3.  Una vez finalizada la instalación, puedes verificar que **"Node.js"** y **"npm"** están instalados correctamente ejecutando los siguientes comandos en tu terminal:

```bash
    node -v
    npm -v
```

**Instalar Angular CLI versión 20**

Angular (CLI) es la herramienta que usaremos para ejecutar la aplicación.

1.  Abre tu terminal o línea de comandos.
2.  Instala el CLI de forma global (`-g`) especificando la versión 20:

    ```bash
    npm install -g @angular/cli@20
    ```

3.  **Comprobar la Versión:**

    Puedes verificar que la instalación fue correcta y que tienes la versión 20 del CLI:

    ```bash
    ng version
    ```

### Clonar y configurar el proyecto

**Clonar el repositorio**

Utiliza `git` para descargar el código fuente

```bash
git clone https://github.com/Metalcl/pokedex-Clikma.git
```

**Accede al repositorio clonado**

Navega a la carpeta recién clonada

```bash
cd pokedex-Clikma
```

**Instala los paquetes y dependencias**

Una vez dentro del directorio, instala todas las dependencias del proyecto definidas en (`package.json`)

```bash
npm install
```

### Ejecuta el proyecto

**Levantar el proyecto**

Inicia el servidor de desarrollo de Angular. La opción (`-o`) abrirá automáticamente la aplicación en tu navegador predeterminado.

```bash
ng serve -o
```

La aplicación estará accesible en tu navegador en la dirección (`http://localhost:4200/`).
