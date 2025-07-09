import '../App.css';
import loader from '../assets/loader.gif';
import {
  Form, FormGroup, Input, Row, Col, Modal, ModalFooter, Label,
  Container, Alert, Button, Table, ModalBody, ModalHeader, FormFeedback
} from 'reactstrap';
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import MovimientosCargados from './MovimientosCargados';

function CargaDeExcel() {

  var hostapi = "http://localhost:5265";
  const [odts, setOdts] = useState([]);
  const [bitacora, setBitacora] = useState([]);
  const [modalMovimientosCargados, setModalMovimientosCargados] = useState(false);
  const [modalProcesando, setModalProcesando] = useState(false);
  const [modalBitacora, setModalBitacora] = useState(false);
  const [sendPropOdT, setSendPropOdT] = useState({});

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
        setOdts(res.data.ordenesDetrabajo)
        setModalProcesando(false)
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
    axios.get(`${hostapi}/api/BitacoraDeCarga1?idOdT1=${id}`)
      .then(res => {
        setBitacora(res.data.bitacora)
        setModalProcesando(false)
        setModalBitacora(!modalBitacora)
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

  return (
    <Container>
      <Form>
        <Row>
          <Col xs="5"></Col>
          <Col xs="5">

            <Input
              type="file"
            />
          </Col>
          <Col>
            <Button
              color="primary"
              type="submit"
            >
              <span style={{marginRight: "1em"}} className="fa-solid fa-upload"></span>
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
                      <Button color="primary" type="button" /* onClick={() => imprimirEtiqueta(etiqueta)} */>
                        <span className="fa-solid fa-print"></span>
                      </Button>
                      <Button color="success" type="button" onClick={() => verMovimientosCargados(odt)}>
                        <span className="fa-solid fa-file-excel"></span>
                      </Button>
                      <Button color="secondary" type="button" onClick={() => verBitacoraDeCarga(odt.idOdT)}>
                        <span className="fa-solid fa-book"></span>
                      </Button>
                      <Button color="danger" type="button" /* onClick={() => dlgEliminar(etiqueta)} */>
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