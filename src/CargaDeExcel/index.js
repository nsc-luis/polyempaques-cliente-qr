import '../App.css';
import loader from '../assets/loader.gif';
import PlantillaDeCargaDeDatos from '../assets/PlantillaDeCargaDeDatos.xlsx';
import {
  Form, FormGroup, Input, Row, Col, Modal, ModalFooter, Label,
  Container, Alert, Button, Table, ModalBody, ModalHeader, FormFeedback
} from 'reactstrap';
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import MovimientosCargados from './MovimientosCargados';

function CargaDeExcel() {

  //var hostapi = "http://localhost:5265";
  var hostapi = "http://192.168.1.100:3000/polyempaques";

  const [odts, setOdts] = useState([]);
  const [bitacora, setBitacora] = useState([]);
  const [modalMovimientosCargados, setModalMovimientosCargados] = useState(false);
  const [modalProcesando, setModalProcesando] = useState(false);
  const [modalBitacora, setModalBitacora] = useState(false);
  const [sendPropOdT, setSendPropOdT] = useState({});
  const [archivoDeExcel, setArchivoDeExcel] = useState(null);
  const [odt, setOdt] = useState({});

  const toggleProcesando = () => {
    setModalProcesando(!modalProcesando);
  }

  const toggleBitacora = () => {
    setModalBitacora(!modalBitacora);
  }

  const toggleMovimientosCargados = () => {
    setModalMovimientosCargados(!modalMovimientosCargados);
  }

  const getOdts = () => {
    toggleProcesando()
    axios.get(`${hostapi}/api/OdT1`)
      .then(res => {
        if (res.data.status === "ok") {
          setOdts(res.data.ordenesDetrabajo)
          setModalProcesando(false)
        }
        else {
          setModalProcesando(false)
          alert(`Error:\n${res.data.message}`)
        }
      })
      .catch(err => {
        setModalProcesando(false)
        alert(`Error:\n${err}`)
      })
  }

  useEffect(() => {
    getOdts();
  }, [])

  const verBitacoraDeCarga = (id) => {
    toggleProcesando()
    axios.get(`${hostapi}/api/BitacoraDeCarga1/${id}`)
      .then(res => {
        if (res.data.status === "ok") {
          setBitacora(res.data.bitacora)
          setModalProcesando(false)
          setModalBitacora(!modalBitacora)
        }
        else {
          setModalProcesando(false)
          alert(`Error:\n${res.data.message}`)
        }
      })
      .catch(err => {
        setModalProcesando(false)
        alert(`Error:\n${err}`)
      })
  }

  const verMovimientosCargados = (odt) => {
    setSendPropOdT(odt);
    toggleMovimientosCargados();
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    toggleProcesando();
    const formData = new FormData();
    formData.append('archivoDeExcel', e.target.archivoDeExcel.files[0]);
    try {
      fetch(`${hostapi}/api/CargaExcel`, { // Replace with your actual API endpoint
        method: 'post',
        body: formData,
      })
        .then(response => {
          if (response.ok) {
            setArchivoDeExcel(null); // Clear selected file after upload
            setModalProcesando(false);
            response.json().then(data => {
              var mensaje = "";
              if (data.error === true) {
                data.mensaje.forEach(msj => {
                  mensaje += `${msj}\n\n`;
                });
                alert(`Error!\n${mensaje}`);
              }
            })
            getOdts(); // Refresh the list of odts after upload
          }
          else {
            setModalProcesando(false);
            response.text().then(text => {
              alert(`Error during upload:\n${text}`);
            });
            response.json().then(data => {
              alert(`Error during upload:\n${data.message}`);

            })
            alert(`Error during upload:\n${response.statusText}`);
          }
        })
    } catch (error) {
      setModalProcesando(false);
      alert(`An error occurred during upload.\n${error}`);
    }
  }

  const dlgEliminar = (odt) => {
    setOdt(odt);
    if (window.confirm(`¿Desea eliminar la ODT ${odt.idOdT} - ${odt.descripcion}?`)) {
      toggleProcesando();
      axios.delete(`${hostapi}/api/OdT1/${odt.idOdT}`)
        .then(res => {
          if (res.data.status === "ok") {
            //alert(`ODT ${odt.idOdT} eliminada correctamente.`);
            getOdts();
          }
          else {
            alert(`Error al eliminar la ODT:\n${res.data.message}`);
          }
        })
        .catch(err => {
          setModalProcesando(false);
          alert(`Error al eliminar la ODT:\n${err}`);
        });
    }
  }

  const imprimirEtiqueta = (odt) => {
    toggleProcesando()
    //axios.get(`${hostapi}/api/DocumentoPDF/ListaPdfOdT/${odt.idOdt}`)
    var data = {
      idOdT: odt.idOdT
    }
    axios.post(`${hostapi}/api/DocumentoPDF/ListaPdfOdT`, data)
      .then(res => {
        if (res.data.status === "ok") {
          res.data.listaArchivos.forEach(file => {
            var request = new Request(
              `${hostapi}/api/DocumentoPDF/EtiquetasDeLaOdt`,
              {
                method: "post",
                body: JSON.stringify(file),
                headers: {
                  'Content-Type': 'application/json'
                },
                mode: "cors",
                cache: "default",
              }
            );
            fetch(request)
              .then((response) => response.blob())
              .then((blob) => {
                const file = window.URL.createObjectURL(blob);
                setModalProcesando(false)
                window.open(file, '_blank');
              })
              .catch((err) => {
                alert(`Error:\n${err}`);
              })
          });
        }
      })
      .catch(err => {
        setModalProcesando(false);
        alert(`Error al procesar las etiquetas:\n${err}`);
      });
  }

  return (
    <Container>
      <Form onSubmit={(e) => handleSubmit(e)}>
        <Row>
          <Col xs="5" style={{ textAlign: "left" }}>
            <a href={PlantillaDeCargaDeDatos}>Descarga la plantilla de Excel para carga de datos.</a>
          </Col>
          <Col>
            <input
              type="file"
              name='archivoDeExcel'
              accept=".xlsx, .xls"
              required
            />
          </Col>
          <Col>
            <Button
              type="submit"
              color="primary"
            >
              <span className="fa-solid fa-upload"></span>
              Cargar
            </Button>
          </Col>
        </Row>
      </Form>
      <Row>
        <Col xs="12">
          <Table striped>
            <thead>
              <tr>
                <th style={{ width: "20%" }}>Descripción</th>
                <th style={{ width: "10%" }}>PO Number (K)</th>
                <th style={{ width: "10%" }}>Part Number(P)</th>
                <th style={{ width: "10%" }}>KG Total a surtir</th>
                <th style={{ width: "10%" }}>KG Surtido</th>
                <th style={{ width: "10%" }}>Fecha y hora</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {odts.map(odt => {
                return (
                  <tr key={odt.idOdT}>
                    <td style={{ textAlign: "left" }}>{odt.descripcion}</td>
                    <td>{odt.poNumber}</td>
                    <td>{odt.partNumber}</td>
                    <td>{odt.totalKgOT}</td>
                    <td>{odt.surtido}</td>
                    <td>{odt.timestamp}</td>
                    <td>
                      <Button color="primary" type="button" onClick={() => imprimirEtiqueta(odt)}>
                        <span className="fa-solid fa-print"></span>
                      </Button>
                      <Button color="success" type="button" onClick={() => verMovimientosCargados(odt)}>
                        <span className="fa-solid fa-file-excel"></span>
                      </Button>
                      <Button color="secondary" type="button" onClick={() => verBitacoraDeCarga(odt.idOdT)}>
                        <span className="fa-solid fa-book"></span>
                      </Button>
                      <Button color="danger" type="button" onClick={() => dlgEliminar(odt)}>
                        <span className="fa-solid fa-xmark"></span>
                      </Button>
                    </td>
                  </tr>
                )
              })
              }
            </tbody>
          </Table>
        </Col>
      </Row>
      <Modal
        isOpen={modalProcesando}
        toggle={toggleProcesando}
        size="sm"
        backdrop="static"
      >
        <ModalBody>
          <p style={{ textAlign: "center" }}>
            <img src={loader} width="50%" height="100%" />
          </p>
        </ModalBody>
      </Modal>
      <Modal
        isOpen={modalBitacora}
        toggle={toggleBitacora}
        size="lg"
        scrollable
      >
        <ModalHeader>
          Bitacora de carga del archivo de Excel
        </ModalHeader>
        <ModalBody>
          <Table
            striped
            hover
            size="sm"
          >
            <thead>
              <tr>
                <th style={{ width: "10%" }}>Id</th>
                <th>Mensaje</th>
              </tr>
            </thead>
            <tbody>
              {bitacora.map(bit => {
                return (
                  <tr key={bit.idBitCarga}>
                    <td>{bit.idBitCarga}</td>
                    <td style={{ textAlign: "left" }}>{bit.mensaje}</td>
                  </tr>
                )
              })
              }
            </tbody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" type="button" onClick={() => toggleBitacora()}>
            Cerrar
          </Button>
        </ModalFooter>
      </Modal>
      <Modal
        isOpen={modalMovimientosCargados}
        toggle={toggleMovimientosCargados}
        size="xl"
        scrollable
      >
        <ModalHeader>
          Movimientos cargados desde archivo de Excel
        </ModalHeader>
        <ModalBody>
          <MovimientosCargados
            idOdT={sendPropOdT.idOdT}
            partNumber={sendPropOdT.partNumber}
            poNumber={sendPropOdT.poNumber}
            descripcion={sendPropOdT.descripcion}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" type="button" onClick={() => toggleMovimientosCargados()}>
            Cerrar
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  )
}
export default CargaDeExcel;