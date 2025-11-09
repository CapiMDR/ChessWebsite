<?php
session_start();

//TODO: Database query with logged user
$history = [
    [
        'id' => 1,
        'date' => '2025-10-30 18:12',
        'opponent' => 'opponent1',
        'color' => 'White',
        'result' => 'Win',
        'pgn' => "1-e4 e5 2-Nf3 Nc6 3-Bb5 a6 4-Ba4 Nf6 5-O-O Be7 6-Re1 b5 7-Bb3 d6"
    ],
    [
        'id' => 2,
        'date' => '2025-10-29 20:05',
        'opponent' => 'opponent2',
        'color' => 'Black',
        'result' => 'Loss',
        'pgn' => "1-e4 e5 2-Nf3 Nc6 3-Bc4 Bc5 4-c3 Nf6 5-d4 exd4 6-cxd4 Bb4+ 7-Nc3 Nxe4"
    ],
    [
        'id' => 3,
        'date' => '2025-09-10 15:20',
        'opponent' => 'CapraStar',
        'color' => 'White',
        'result' => 'Draw',
        'pgn' => "1.d4 Nf6 2.Bf4 Nc6 3.e3 Nd5 4.Bg3 e6 5.Nd2 Nf6 6.Ngf3 d5 7.Bb5 Bd7 8.O-O Bd6 9.Bxd6 cxd6 10.Qe2 Qb6 11.a3 a6 12.Bxc6 Bxc6 13.Qd3 O-O 14.Rab1 Rae8 15.Qc3 Ne4 16.Qd3 e5 17.h3 Nf6 18.Qb3 Qa5 19.Rbd1 e4 20.Nh4 Ba4 21.Qxb7 Bxc2 22.Nf5 Bxd1 23.Rxd1 Rb8 24.Qc6 Rxb2 25.Ne7 Kh8 26.Qxd6 Rxd2 27.Rxd2 Qxd2 28.Nxd5 Qd1 29.Kh2 Ra8 30.Nxf6 gxf6 31.Qxf6 Kg8 32.Qg5 Kf8 33.Qc5 Kg7 34.Qg5 Kh8 35.Qf6 Kg8 36.Qg5 Kf8 37.Qc5 Kg8 38.Qg5"
    ],
    [
        'id' => 4,
        'date' => '2025-09-10 15:20',
        'opponent' => 'checkmate',
        'color' => 'White',
        'result' => 'Draw',
        'pgn' => "1-e4 d5 2-exd5 Qxd5 3-Nc3 Qe5+ 4-Be2 Bg4 5-d4 Bxe2 6-Ngxe2 Nc6 7-d5 O-O-O 8-dxc6 Rxd1+ 9-Kxd1 bxc6 10-Bf4 Qf6 11-Nd5 Qxb2 12-Bxc7 Qxa1+ 13-Nc1 Kd7 14-Re1 e6 15-Be5 Qb1 16-Nc3 Qb2 17-Nb3 Bb4 18-Re3 Ne7 19-Na4 Qa3 20-Nbc5+ Bxc5 21-Nxc5+ Qxc5 22-Bxg7 Rg8 23-Be5 Nd5 24-Rd3 Rxg2 25-c4 Rg1+ 26-Ke2 Qxc4 27-Bg3 Qe4+ 28-Kd2 Qe1+ 29-Kc2 Qb1+ 30-Kd2 Qc1+ 31-Ke2 Re1+ 32-Kf3 f5 33-Rb3 Qc4 34-Rb4 Qxb4 35-h4 Qe4#"
    ],
    [
        'id' => 5,
        'date' => '2025-09-10 15:20',
        'opponent' => 'CapraStar',
        'color' => 'White',
        'result' => 'Win',
        'pgn' => "1.e4 c6 2.d4 d6 3.Nc3 Qc7 4.Nf3 Nd7 5.Be3 Ngf6 6.Bd3 e5 7.O-O Be7 8.Re1 O-O 9.h3 d5 10.exd5 Nxd5 11.Nxd5 cxd5 12.dxe5 Nxe5 13.Nxe5 Qxe5 14.Bxa7 Qxb2 15.Be3 Rxa2 16.Rxa2 Qxa2 17.Qh5 g6 18.Qe5 Qa5 19.Bh6 Qxe1 20.Qxe1 Bf6 21.Bxf8 Kxf8 22.Qa5 Be6 23.Qa8 Kg7 24.Qxb7 h5 25.f3 Bd4 26.Kf1 Kf6 27.Qa6 Be5 28.Bb5 h4 29.Bd7 g5 30.Bxe6 fxe6 31.Ke2 Kf5 32.Kd3 Bg7 33.Qc6 Be5 34.Qe8 Bf6 35.Ke3 Be5 36.Qc6 Bf6 37.c4 d4 38.Kd3 e5 39.Qe4 Ke6 40.c5 Ke7 41.c6 Kd6 42.Kc4 Kc7 43.Kb5 Bg7 44.Qh7 Kd6 45.Qxg7 Ke6 46.Qxg5 d3 47.Qxh4 Kf7 48.Qh6 d2 49.Qxd2 Kg6 50.c7 e4 51.c8=Q e3 52.Qd3 Kg7 53.Qcd7 Kf8 54.Q3f5 Kg8 55.Qdf7 Kh8 56.Q5h7"
    ],
    [
        'id' => 6,
        'date' => '2025-09-10 15:20',
        'opponent' => 'en passant',
        'color' => 'White',
        'result' => 'Draw',
        'pgn' => "1-e4 c5 2-e5 d5 3-exd6 Qxd6"
    ],
    [
        'id' => 7,
        'date' => '2025-09-10 15:20',
        'opponent' => 'castling',
        'color' => 'White',
        'result' => 'Draw',
        'pgn' => "1-d4 d5 2-c4 e6 3-Nc3 Nf6 4-Nf3 c5 5-cxd5 exd5 6-Bg5 Be7 7-e3 O-O 8-Be2 Nc6 9-O-O"
    ],
];

//Return history
echo json_encode(['user' => $_SESSION['user'], 'history' => $history]);
