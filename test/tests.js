'use strict';

if (typeof require !== 'undefined') {
  var chai = require('chai');
  var Xiangqi = require('../xiangqi').Xiangqi;
}

var assert = chai.assert;

/*
describe('Perft', function() {
  var perfts = [
    {fen: 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R r KQkq - 0 1',
      depth: 3, nodes: 97862},
    {fen: '8/PPP4k/8/8/8/8/4Kppp/8 r - - 0 1',
      depth: 4, nodes: 89363},
    {fen: '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 r - - 0 1',
      depth: 4, nodes: 43238},
    {fen: 'rnbqkbnr/p3pppp/2p5/1pPp4/3P4/8/PP2PPPP/RNBQKBNR r KQkq b6 0 4',
      depth: 3, nodes: 23509},
  ];

  perfts.forEach(function(perft) {
    var xiangqi = new Xiangqi();
    xiangqi.load(perft.fen);

    it(perft.fen, function() {
      var nodes = xiangqi.perft(perft.depth);
      assert(nodes === perft.nodes);
    });

  });
});
*/

describe('Single Square Move Generation', function() {

  var positions = [
    {fen: 'rnbakabnr/9/1c5c1/p1p1P1p1p/9/9/P1P3P1P/1C5C1/4A4/RNB1KABNR r - - 0 1',
      square: 'e6', verbose: false, moves: ['e6e7', 'e6d6', 'e6f6']},
    {fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r - - 0 1',
      square: 'j0', verbose: false, moves: []},  // invalid square
    {fen: '2ba1k3/2R1a4/b8/9/9/9/9/9/9/4K4 r - - 0 1',
      square: 'd9', verbose: false, moves: []},  // pinned piece
    // {fen: '8/k7/8/8/8/8/7p/K7 b - - 0 1',
    //   square: 'h2', verbose: false, moves: ['h1=Q+', 'h1=R+', 'h1=B', 'h1=N']},  // 
    // {fen: 'r1bq1rk1/1pp2ppp/p1np1n2/2b1p3/2B1P3/2NP1N2/PPPBQPPP/R3K2R r KQ - 0 8',
    //   square: 'e1', verbose: false, moves: ['Kf1', 'Kd1', 'O-O', 'O-O-O']},  // castling
    // {fen: 'r1bq1rk1/1pp2ppp/p1np1n2/2b1p3/2B1P3/2NP1N2/PPPBQPPP/R3K2R r - - 0 8',
    //   square: 'e1', verbose: false, moves: ['Kf1', 'Kd1']},  // no castling
    {fen: '9/3R5/5k3/9/9/9/2p6/9/9/4K4 b - - 0 1',
      square: 'f7', verbose: false, moves: []},  // trapped king
    {fen: '9/3R5/5k3/9/9/9/2p6/9/9/4K4 b - - 0 1',
      square: 'c3', verbose: true,
      moves:
        [{color:'b', from:'c3', to:'c2', flags:'n', piece:'p', iccs:'c3c2'},
         {color:'b', from:'c3', to:'b3', flags:'n', piece:'p', iccs:'c3b3'},
         {color:'b', from:'c3', to:'d3', flags:'n', piece:'p', iccs:'c3d3'}]
    }, // verbose
    // {fen: 'rnbqk2r/ppp1pp1p/5n1b/3p2pQ/1P2P3/B1N5/P1PP1PPP/R3KBNR b KQkq - 3 5',
    //   square: 'f1', verbose: true, moves: []},  // issue #30
  ];

  positions.forEach(function(position) {
    var xiangqi = new Xiangqi();
    xiangqi.load(position.fen);

    it(position.fen + ' ' + position.square, function() {

      var moves = xiangqi.moves({square: position.square, verbose: position.verbose});
      var passed = position.moves.length === moves.length;

      for (var j = 0; j < moves.length; j++) {
        if (!position.verbose) {
          passed = passed && moves[j] === position.moves[j];
        } else {
          for (var k in moves[j]) {
            passed = passed && moves[j][k] === position.moves[j][k];
          }
        }
      }
      assert(passed);

    });

  });

});


describe('Checkmate', function() {

  var checkmates = [
    '4k4/9/9/9/9/9/9/9/4Ar3/2r1K4 r - - 0 7',
    '1R2kab2/5R3/9/p3p2r1/3n5/4P3p/P8/9/4A4/4K4 b - - 0 2',
    '5kC2/4a1N2/3a5/9/9/9/9/r3C4/4p4/2rK4R r - - 0 8',
    '5a3/3R5/4k4/4P2Np/9/9/9/9/9/5K3 b - - 0 1',
    'rnbakab1r/9/1c5c1/p1p5p/4p1p2/4P1P2/P1P3nCP/1C3A3/4NK3/RNB2AB1R r - - 0 1'
  ];

  checkmates.forEach(function(checkmate) {
    var xiangqi = new Xiangqi();
    xiangqi.load(checkmate);

    it(checkmate, function() {
      assert(xiangqi.in_checkmate());
    });
  });

});


describe('Stalemate', function() {

  var stalemates = [
    '3aca3/1Cnrk4/b3r4/2p1n4/2b6/9/9/9/4C4/ppppcK3 b - - 0 1',
    '4k4/4a4/9/9/9/9/9/9/3r1r3/4K4 r - - 0 2',
  ];

  stalemates.forEach(function(stalemate) {
    var xiangqi = new Xiangqi();
    xiangqi.load(stalemate);

    it(stalemate, function() {
      assert(xiangqi.in_stalemate());
    });

  });

});


describe('Insufficient Material', function() {

  var positions = [
    {fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r - - 0 1', draw: false},
    {fen: '4k4/4a4/9/9/9/9/9/9/9/4K4 r - - 0 1', draw: true},
    {fen: '4k4/9/9/4p4/9/9/9/9/9/4K4 r - - 0 1', draw: false},
    {fen: '4k4/9/9/9/9/9/9/4n4/9/4K4 r - - 0 1', draw: false},
    {fen: '5a3/9/4k4/9/9/9/9/9/4A4/4K4 b - - 0 1', draw: true},
    {fen: '4k4/9/b8/9/9/9/9/9/4A4/4K4 r - - 0 1', draw: true},
    {fen: '4k4/9/4b4/9/9/9/9/4B4/9/4K4 r - - 0 1', draw: true},
    {fen: '4k4/9/9/9/9/9/9/9/5r3/2r1K4 r - - 0 1', draw: false},
    {fen: '4k1b2/9/4b4/9/9/9/9/4B4/9/4K1B2 r - - 0 1', draw: true},
    {fen: '5kC2/4a1N2/3a5/9/9/9/9/r3C4/4p4/2rK4R r - - 0 1', draw: false}
  ];

  positions.forEach(function(position) {
    var xiangqi = new Xiangqi();
    xiangqi.load(position.fen);

    it(position.fen, function() {
      if (position.draw) {
        assert(xiangqi.insufficient_material() && xiangqi.in_draw());
      } else {
        assert(!xiangqi.insufficient_material() && !xiangqi.in_draw());
      }
    });

  });

});


describe('Threefold Repetition', function() {

  var positions = [
    {fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r - - 0 1',
     moves: ['h0g2', 'h9g7', 'g2h0', 'g7h9', 'h0g2', 'h9g7', 'g2h0', 'g7h9']},

    {fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r - - 0 1',
     moves: ['h0g2', 'h9g7', 'g2h0', 'g7h9', 'h0i2', 'h9i7', 'i2h0', 'i7h9']},

    {fen: '2ba1k3/4a1P2/9/p7p/5n3/4p4/3r5/4p4/5K3/3r5 r - - 0 27',
     moves: [  'g8h8', 'f9e9', 'h8g8', 'c9e7', 'g8f8', 'f5d4', 'f8g8', 'd4b3',
       'g8f8', 'e4e3', 'f8g8', 'd0d2', 'f1f0', 'e2e1', 'g8f8', 'e3e2', 'f8g8',
       'd2d1', 'g8f8', 'a6a5', 'f8g8', 'a5a4', 'g8f8', 'a4a3', 'f8g8', 'i6i5',
       'g8f8', 'i5i4', 'f8g8', 'i4i3', 'g8f8', 'i3h3', 'f8g8', 'h3g3', 'g8f8',
       'g3g2', 'f8g8', 'g2f2', 'g8f8', 'a3a2', 'f8g8', 'a2b2', 'g8f8', 'b2c2',
       'f8g8', 'c2d2', 'g8f8', 'd3e3', 'f8g8', 'e3d3', 'g8f8', 'd3e3', 'f8g8',
       'e3d3']},

    {fen: '3a1kC2/4a4/6P2/p1R1P4/9/8p/P8/4B4/9/3AKAB2 b - - 0 28',
     moves: [  'f9e9', 'e6e7', 'e9f9', 'g7g8', 'f9e9', 'g9i9', 'e9f9', 'c6d6',
       'f9e9', 'd0e1', 'e9f9', 'e0d0', 'f9e9', 'd0e0', 'e9f9', 'e0d0', 'f9e9',
       'd0e0']},
  ];

  positions.forEach(function(position) {
    var xiangqi = new Xiangqi();
    xiangqi.load(position.fen);

    it(position.fen, function() {

      var passed = true;
      for (var j = 0; j < position.moves.length; j++) {
        if (xiangqi.in_threefold_repetition()) {
          passed = false;
          break;
        }
        xiangqi.move(position.moves[j]);
      }

      // assert(passed && xiangqi.in_threefold_repetition() && !xiangqi.in_draw());

      // Just a temporary workaround, should be refined in the future.
      assert(passed && xiangqi.in_threefold_repetition() && xiangqi.in_draw());

    });

  });

});

/*
describe('Algebraic Notation', function() {

  var positions = [
    {fen: '7k/3R4/3p2Q1/6Q1/2N1N3/8/8/3R3K r - - 0 1',
     moves: ['Rd8#', 'Re7', 'Rf7', 'Rg7', 'Rh7#', 'R7xd6', 'Rc7', 'Rb7', 'Ra7',
             'Qf7', 'Qe8#', 'Qg7#', 'Qg8#', 'Qh7#', 'Q6h6#', 'Q6h5#', 'Q6f5',
             'Q6f6#', 'Qe6', 'Qxd6', 'Q5f6#', 'Qe7', 'Qd8#', 'Q5h6#', 'Q5h5#',
             'Qh4#', 'Qg4', 'Qg3', 'Qg2', 'Qg1', 'Qf4', 'Qe3', 'Qd2', 'Qc1',
             'Q5f5', 'Qe5+', 'Qd5', 'Qc5', 'Qb5', 'Qa5', 'Na5', 'Nb6', 'Ncxd6',
             'Ne5', 'Ne3', 'Ncd2', 'Nb2', 'Na3', 'Nc5', 'Nexd6', 'Nf6', 'Ng3',
             'Nf2', 'Ned2', 'Nc3', 'Rd2', 'Rd3', 'Rd4', 'Rd5', 'R1xd6', 'Re1',
             'Rf1', 'Rg1', 'Rc1', 'Rb1', 'Ra1', 'Kg2', 'Kh2', 'Kg1']},
    {fen: '1r3k2/P1P5/8/8/8/8/8/R3K2R r KQ - 0 1',
     moves: ['a8=Q', 'a8=R', 'a8=B', 'a8=N', 'axb8=Q+', 'axb8=R+', 'axb8=B',
             'axb8=N', 'c8=Q+', 'c8=R+', 'c8=B', 'c8=N', 'cxb8=Q+', 'cxb8=R+',
             'cxb8=B', 'cxb8=N', 'Ra2', 'Ra3', 'Ra4', 'Ra5', 'Ra6', 'Rb1',
             'Rc1', 'Rd1', 'Kd2', 'Ke2', 'Kf2', 'Kf1', 'Kd1', 'Rh2', 'Rh3',
             'Rh4', 'Rh5', 'Rh6', 'Rh7', 'Rh8+', 'Rg1', 'Rf1+', 'O-O+',
             'O-O-O']},
    {fen: '5rk1/8/8/8/8/8/2p5/R3K2R r KQ - 0 1',
     moves: ['Ra2', 'Ra3', 'Ra4', 'Ra5', 'Ra6', 'Ra7', 'Ra8', 'Rb1', 'Rc1',
             'Rd1', 'Kd2', 'Ke2', 'Rh2', 'Rh3', 'Rh4', 'Rh5', 'Rh6', 'Rh7',
             'Rh8+', 'Rg1+', 'Rf1']},
    {fen: '5rk1/8/8/8/8/8/2p5/R3K2R b KQ - 0 1',
     moves: ['Rf7', 'Rf6', 'Rf5', 'Rf4', 'Rf3', 'Rf2', 'Rf1+', 'Re8+', 'Rd8',
             'Rc8', 'Rb8', 'Ra8', 'Kg7', 'Kf7', 'c1=Q+', 'c1=R+', 'c1=B',
             'c1=N']},
    {fen: 'r3k2r/p2pqpb1/1n2pnp1/2pPN3/1p2P3/2N2Q1p/PPPB1PPP/R3K2R r KQkq c6 0 2',
     moves: ['gxh3', 'Qxf6', 'Qxh3', 'Nxd7', 'Nxf7', 'Nxg6', 'dxc6', 'dxe6',
             'Rg1', 'Rf1', 'Ke2', 'Kf1', 'Kd1', 'Rb1', 'Rc1', 'Rd1', 'g3',
             'g4', 'Be3', 'Bf4', 'Bg5', 'Bh6', 'Bc1', 'b3', 'a3', 'a4', 'Qf4',
             'Qf5', 'Qg4', 'Qh5', 'Qg3', 'Qe2', 'Qd1', 'Qe3', 'Qd3', 'Na4',
             'Nb5', 'Ne2', 'Nd1', 'Nb1', 'Nc6', 'Ng4', 'Nd3', 'Nc4', 'd6',
             'O-O', 'O-O-O']},
    {fen: 'k7/8/K7/8/3n3n/5R2/3n4/8 b - - 0 1',
     moves: ['N2xf3', 'Nhxf3', 'Nd4xf3', 'N2b3', 'Nc4', 'Ne4', 'Nf1', 'Nb1',
             'Nhf5', 'Ng6', 'Ng2', 'Nb5', 'Nc6', 'Ne6', 'Ndf5', 'Ne2', 'Nc2',
             'N4b3', 'Kb8']},
  ];

  positions.forEach(function(position) {
    var xiangqi = new Xiangqi();
    var passed = true;
    xiangqi.load(position.fen);

    it(position.fen, function() {
      var moves = xiangqi.moves();
      if (moves.length !== position.moves.length) {
        passed = false;
      } else {
        for (var j = 0; j < moves.length; j++) {
          if (position.moves.indexOf(moves[j]) === -1) {
            passed = false;
            break;
          }
        }
      }
      assert(passed);
    });

  });

});
*/

describe('Get/Put/Remove', function() {

  var xiangqi = new Xiangqi();
  var passed = true;
  // noinspection JSDuplicatedDeclaration,JSHint
  var positions = [
    {pieces: {a9: {type: xiangqi.PAWN, color: xiangqi.RED},
              b0: {type: xiangqi.PAWN, color: xiangqi.BLACK},
              c8: {type: xiangqi.KNIGHT, color: xiangqi.RED},
              d7: {type: xiangqi.KNIGHT, color: xiangqi.BLACK},
              e6: {type: xiangqi.ROOK, color: xiangqi.RED},
              f5: {type: xiangqi.ROOK, color: xiangqi.BLACK},
              g4: {type: xiangqi.BISHOP, color: xiangqi.RED},
              g5: {type: xiangqi.BISHOP, color: xiangqi.BLACK},
              d2: {type: xiangqi.ADVISER, color: xiangqi.RED},
              f7: {type: xiangqi.ADVISER, color: xiangqi.BLACK},
              e0: {type: xiangqi.KING, color: xiangqi.RED},
              e7: {type: xiangqi.KING, color: xiangqi.BLACK}},
     should_pass: true},

    {pieces: {a7: {type: 'z', color: xiangqi.RDE}}, // bad piece
     should_pass: false},

    {pieces: {j4: {type: xiangqi.PAWN, color: xiangqi.RDE}}, // bad square
     should_pass: false},

    /* disallow two kings (black) */
    {pieces: {d7: {type: xiangqi.KING, color: xiangqi.BLACK},
              f2: {type: xiangqi.KING, color: xiangqi.RED},
              e8: {type: xiangqi.KING, color: xiangqi.BLACK}},
      should_pass: false},

    /* disallow two kings (white) */
    {pieces: {d7: {type: xiangqi.KING, color: xiangqi.BLACK},
              f2: {type: xiangqi.KING, color: xiangqi.RED},
              e1: {type: xiangqi.KING, color: xiangqi.RED}},
      should_pass: false},

    /* allow two kings if overwriting the exact same square */
    {pieces: {d7: {type: xiangqi.KING, color: xiangqi.BLACK},
              f2: {type: xiangqi.KING, color: xiangqi.RED},
              f2: {type: xiangqi.KING, color: xiangqi.RED}},
      should_pass: true},
  ];

  positions.forEach(function(position) {

    passed = true;
    xiangqi.clear();

    it('position should pass - ' + position.should_pass, function() {
      var square, j, piece;

      /* places the pieces */
      for (square in position.pieces) {
        passed = xiangqi.put(position.pieces[square], square);
        if (!passed) break;
      }

      /* iterate over every square to make sure get returns the proper
       * piece values/color
       */
      for (j = 0; j < xiangqi.SQUARES.length; j++) {
        square = xiangqi.SQUARES[j];
        if (!(square in position.pieces)) {
          if (xiangqi.get(square)) {
            passed = false;
            break;
          }
        } else {
          piece = xiangqi.get(square);
          if (!(piece &&
              piece.type === position.pieces[square].type &&
              piece.color === position.pieces[square].color)) {
            passed = false;
            break;
          }
        }
      }

      if (passed) {
        /* remove the pieces */
        for (j = 0; j < xiangqi.SQUARES.length; j++) {
          square = xiangqi.SQUARES[j];
          piece = xiangqi.remove(square);
          if ((!(square in position.pieces)) && piece) {
            passed = false;
            break;
          }

          if (piece &&
             (position.pieces[square].type !== piece.type ||
              position.pieces[square].color !== piece.color)) {
            passed = false;
            break;
          }
        }
      }

      /* finally, check for an empty board */
      passed = passed && (xiangqi.fen() === '9/9/9/9/9/9/9/9/9/9 r - - 0 1');

      /* some tests should fail, so make sure we're supposed to pass/fail each
       * test
       */
      passed = (passed === position.should_pass);

      assert(passed);
    });

  });

});


describe('FEN', function() {

  var positions = [
    {fen: '9/9/9/9/9/9/9/9/9/9 r - - 0 1', should_pass: false},
    {fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r - - 0 1', should_pass: true},
    {fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/4P4/P1P3P1P/1C5C1/9/RNBAKABNR b - - 0 1', should_pass: true},
    {fen: '1nbakabn1/9/1c5c1/p1p3p1p/4p4/4P4/P1P3P1P/1C5C1/9/1NBAKABN1 b - - 1 2', should_pass: true},

    /* incomplete FEN string */
    {fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABN r - - 0 1', should_pass: false},

    /* bad digit (8)*/
    {fen: 'rnbakabnr/8/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r - - 0 1', should_pass: false},

    /* bad piece (X)*/
    {fen: '1nbakabn1/9/1c5c1/p1p3p1X/4p4/4P4/P1P3P1P/1C5C1/9/1NBAKABN1 b - - 1 2', should_pass: false},
  ];

  positions.forEach(function(position) {
    var xiangqi = new Xiangqi();

    it(position.fen + ' (' + position.should_pass + ')', function() {
      xiangqi.load(position.fen);
      assert(xiangqi.fen() === position.fen === position.should_pass);
    });

  });

});

/*
describe('PGN (Chinese Format)', function() {

  var passed = true;
  var error_message;
  var positions = [
    {moves: ['d4', 'd5', 'Nf3', 'Nc6', 'e3', 'e6', 'Bb5', 'g5', 'O-O', 'Qf6', 'Nc3',
             'Bd7', 'Bxc6', 'Bxc6', 'Re1', 'O-O-O', 'a4', 'Bb4', 'a5', 'b5', 'axb6',
             'axb6', 'Ra8+', 'Kd7', 'Ne5+', 'Kd6', 'Rxd8+', 'Qxd8', 'Nxf7+', 'Ke7',
             'Nxd5+', 'Qxd5', 'c3', 'Kxf7', 'Qf3+', 'Qxf3', 'gxf3', 'Bxf3', 'cxb4',
             'e5', 'dxe5', 'Ke6', 'b3', 'Kxe5', 'Bb2+', 'Ke4', 'Bxh8', 'Nf6', 'Bxf6',
             'h5', 'Bxg5', 'Bg2', 'Kxg2', 'Kf5', 'Bh4', 'Kg4', 'Bg3', 'Kf5', 'e4+',
             'Kg4', 'e5', 'h4', 'Bxh4', 'Kxh4', 'e6', 'c5', 'bxc5', 'bxc5', 'e7', 'c4',
             'bxc4', 'Kg4', 'e8=Q', 'Kf5', 'Qe5+', 'Kg4', 'Re4#'],
     header: ['Red', 'lengyanyu258', 'Black', 'Steve Bragg', 'GreatestGameEverPlayed?', 'True'],
     max_width:19,
     newline_char:'<br />',
     pgn: '[Red "lengyanyu258"]<br />[Black "Steve Bragg"]<br />[GreatestGameEverPlayed? "True"]<br /><br />1. d4 d5 2. Nf3 Nc6<br />3. e3 e6 4. Bb5 g5<br />5. O-O Qf6<br />6. Nc3 Bd7<br />7. Bxc6 Bxc6<br />8. Re1 O-O-O<br />9. a4 Bb4 10. a5 b5<br />11. axb6 axb6<br />12. Ra8+ Kd7<br />13. Ne5+ Kd6<br />14. Rxd8+ Qxd8<br />15. Nxf7+ Ke7<br />16. Nxd5+ Qxd5<br />17. c3 Kxf7<br />18. Qf3+ Qxf3<br />19. gxf3 Bxf3<br />20. cxb4 e5<br />21. dxe5 Ke6<br />22. b3 Kxe5<br />23. Bb2+ Ke4<br />24. Bxh8 Nf6<br />25. Bxf6 h5<br />26. Bxg5 Bg2<br />27. Kxg2 Kf5<br />28. Bh4 Kg4<br />29. Bg3 Kf5<br />30. e4+ Kg4<br />31. e5 h4<br />32. Bxh4 Kxh4<br />33. e6 c5<br />34. bxc5 bxc5<br />35. e7 c4<br />36. bxc4 Kg4<br />37. e8=Q Kf5<br />38. Qe5+ Kg4<br />39. Re4#',
     fen: '8/8/8/4Q3/2P1R1k1/8/5PKP/8 b - - 4 39'},
    {moves: ['c4', 'e6', 'Nf3', 'd5', 'd4', 'Nf6', 'Nc3', 'Be7', 'Bg5', 'O-O', 'e3', 'h6',
             'Bh4', 'b6', 'cxd5', 'Nxd5', 'Bxe7', 'Qxe7', 'Nxd5', 'exd5', 'Rc1', 'Be6',
             'Qa4', 'c5', 'Qa3', 'Rc8', 'Bb5', 'a6', 'dxc5', 'bxc5', 'O-O', 'Ra7',
             'Be2', 'Nd7', 'Nd4', 'Qf8', 'Nxe6', 'fxe6', 'e4', 'd4', 'f4', 'Qe7',
             'e5', 'Rb8', 'Bc4', 'Kh8', 'Qh3', 'Nf8', 'b3', 'a5', 'f5', 'exf5',
             'Rxf5', 'Nh7', 'Rcf1', 'Qd8', 'Qg3', 'Re7', 'h4', 'Rbb7', 'e6', 'Rbc7',
             'Qe5', 'Qe8', 'a4', 'Qd8', 'R1f2', 'Qe8', 'R2f3', 'Qd8', 'Bd3', 'Qe8',
             'Qe4', 'Nf6', 'Rxf6', 'gxf6', 'Rxf6', 'Kg8', 'Bc4', 'Kh8', 'Qf4'],
     header: ['Event', 'Reykjavik WCh', 'Site', 'Reykjavik WCh', 'Date', '1972.01.07', 'EventDate', '?', 'Round', '6', 'Result', '1-0',
            'Red', 'Robert James Fischer', 'Black', 'Boris Spassky', 'ECO', 'D59', 'WhiteElo', '?', 'BlackElo', '?', 'PlyCount', '81'],
     max_width:65,
     pgn: '[Event "Reykjavik WCh"]\n[Site "Reykjavik WCh"]\n[Date "1972.01.07"]\n[EventDate "?"]\n[Round "6"]\n[Result "1-0"]\n[Red "Robert James Fischer"]\n[Black "Boris Spassky"]\n[ECO "D59"]\n[WhiteElo "?"]\n[BlackElo "?"]\n[PlyCount "81"]\n\n1. c4 e6 2. Nf3 d5 3. d4 Nf6 4. Nc3 Be7 5. Bg5 O-O 6. e3 h6\n7. Bh4 b6 8. cxd5 Nxd5 9. Bxe7 Qxe7 10. Nxd5 exd5 11. Rc1 Be6\n12. Qa4 c5 13. Qa3 Rc8 14. Bb5 a6 15. dxc5 bxc5 16. O-O Ra7\n17. Be2 Nd7 18. Nd4 Qf8 19. Nxe6 fxe6 20. e4 d4 21. f4 Qe7\n22. e5 Rb8 23. Bc4 Kh8 24. Qh3 Nf8 25. b3 a5 26. f5 exf5\n27. Rxf5 Nh7 28. Rcf1 Qd8 29. Qg3 Re7 30. h4 Rbb7 31. e6 Rbc7\n32. Qe5 Qe8 33. a4 Qd8 34. R1f2 Qe8 35. R2f3 Qd8 36. Bd3 Qe8\n37. Qe4 Nf6 38. Rxf6 gxf6 39. Rxf6 Kg8 40. Bc4 Kh8 41. Qf4 1-0',
     fen: '4q2k/2r1r3/4PR1p/p1p5/P1Bp1Q1P/1P6/6P1/6K1 b - - 4 41'},
    {moves: ['f3', 'e5', 'g4', 'Qh4#'],     // testing max_width being small and having no comments
     header: [],
     max_width:1,
     pgn: '1. f3 e5\n2. g4 Qh4#',
     fen: 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR r KQkq - 1 3'},
    {moves: ['Ba5', 'O-O', 'd6', 'd4'],     // testing a non-starting position
     header: [],
     max_width:20,
     pgn: '[SetUp "1"]\n[FEN "r1bqk1nr/pppp1ppp/2n5/4p3/1bB1P3/2P2N2/P2P1PPP/RNBQK2R b KQkq - 0 1"]\n\n1. ... Ba5 2. O-O d6\n3. d4',
     starting_position: 'r1bqk1nr/pppp1ppp/2n5/4p3/1bB1P3/2P2N2/P2P1PPP/RNBQK2R b KQkq - 0 1',
     fen: 'r1bqk1nr/ppp2ppp/2np4/b3p3/2BPP3/2P2N2/P4PPP/RNBQ1RK1 b kq d3 0 3'}
    ];

  positions.forEach(function(position, i) {

    it(i, function() {
      var xiangqi = ('starting_position' in position) ? new Xiangqi(position.starting_position) : new Xiangqi();
      passed = true;
      error_message = '';
      for (var j = 0; j < position.moves.length; j++) {
        if (xiangqi.move(position.moves[j]) === null) {
          error_message = 'move() did not accept ' + position.moves[j] + ' : ';
          break;
        }
      }

      xiangqi.header.apply(null, position.header);
      var pgn = xiangqi.pgn({max_width:position.max_width, newline_char:position.newline_char});
      var fen = xiangqi.fen();
      passed = pgn === position.pgn && fen === position.fen;
      assert(passed && error_message.length === 0);
    });

  });

});


describe('Load PGN (Chinese Format)', function() {

  var xiangqi = new Xiangqi();
  var tests = [
    {
      pgn: [
        '[Game "Chinese Chess"]',
        '[Event "第24届“五羊杯”全国冠军邀请赛"]',
        '[Site "广州"]',
        '[Date "2004.01.05"]',
        '[Round "决赛(加赛)"]',
        '[RedTeam "广州"]',
        '[Red "吕钦"]',
        '[BlackTeam "广州"]',
        '[Black "许银川"]',
        '[Result "1-0"]',
        '[Opening "中炮过河炮对左三步虎"]',
        '[ECCO "B24"]',
        '',
        ' 1. 炮二平五 马８进７',
        ' 2. 马二进三 车９平８',
        ' 3. 兵三进一 炮８平９',
        ' 4. 马八进七 卒３进１',
        ' 5. 炮八进四 马２进３',
        ' 6. 炮八平七 车１平２',
        ' 7. 车九平八 象３进５',
        ' 8. 车八进四 车８进４',
        ' 9. 炮七平三 炮２平１',
        '10. 车八进五 马３退２',
        '11. 车一进一 马２进３',
        '12. 车一平八 马３进４',
        '13. 车八进三 马４进３',
        '14. 炮三平九 车８平４',
        '15. 仕六进五 车４退１',
        '16. 炮九退一 车４平３',
        '17. 相七进九 炮１平３',
        '18. 炮九进四 炮３退２',
        '19. 马三进四 车３平１',
        '20. 炮九平八 马３进５',
        '21. 相三进五 炮９进４',
        '22. 马四进六 车１退２',
        '23. 相九退七 车１平４',
        '24. 马六进四 车４平６',
        '25. 车八平四 马７退５',
        '26. 兵三进一 马５进３',
        '27. 炮八平九 马３退２',
        '28. 炮九平七 象５退３',
        '29. 兵三进一 马２进３',
        '30. 车四平六 车６进１',
        '31. 兵九进一 士６进５',
        '32. 相五退三 卒３进１',
        '33. 车六平七 马３进４',
        '34. 马四退三 炮９平７',
        '35. 马三进二 马４进６',
        '36. 相七进五 象７进５',
        '37. 车七平五 炮７平８',
        '38. 兵三进一 车６进１',
        '39. 马二退三 车６进１',
        '40. 车五进二 车６平７',
        '41. 车五平二 炮８平７',
        '42. 仕五进六 车７退２',
        '43. 车二退三 炮７进２',
        '44. 兵五进一 炮７平６',
        '45. 车二平五 车７进２',
        '46. 兵五进一 卒９进１',
        '47. 马七进六 卒９进１',
        '48. 马三退二 马６进７',
        '49. 车五平四 炮６平４',
        '50. 马六进四 卒９平８',
        '51. 车四退二 卒８进１',
        '52. 马二退一 马７退８',
        '53. 车四平六 马８退６',
        '54. 兵五平四 车７平６',
        '55. 马一进三 卒８平７',
        '56. 马三进一 卒７平８',
        '57. 车六平九 车６进１',
        '58. 马一退三 卒８平７',
        '59. 相五退七 车６平５',
        '60. 马三进五 卒７平６',
        '61. 仕六退五 卒６平５',
        '62. 马五进三 车５平７',
        '63. 马三退四 卒５平６',
        '64. 马四进二 车７平６',
        '65. 车九进二 卒６平７',
        '66. 相七进五 卒７平８',
        '67. 马二进四 卒８平７',
        '68. 马四退六 车６进１',
        '69. 车九退二 车６平４',
        '70. 兵九进一 卒７平６',
        '71. 车九进三 卒６平５',
        '72. 车九平五 1-0'
      ],
      expect: true
    },
    {
      pgn: [
        '[Game "Chinese Chess"]',
        '[Event "1982年全国赛"]',
        '[Date "1982.12.11"]',
        '[Red "柳大华"]',
        '[Black "杨官璘"]',
        '[Result "1/2-1/2"]',
        '',
        '1.  炮八平五 马２进３ 2.  马八进七 车１平２ 3.  车九平八 马８进７',
        '4.  兵三进一 卒３进１ 5.  车八进六 炮２平１ 6.  车八平七 炮１退１',
        '7.  马二进三 士６进５ 8.  炮二平一 炮１平３ 9.  车七平六 马３进２',
        '10. 车一平二 车９平８ 11. 马七退五 卒３进１ 12. 车六退一 炮３进５',
        '13. 车二进六 马２进４ 14. 炮五平七 车２进２ 15. 炮七进二 车２平４',
        '16. 马三进四 炮８平９ 17. 车二平三 车８进７ 18. 兵三进一 炮３平２',
        '19. 兵三平四 炮２进３ 20. 马五进三 马４退６ 21. 仕四进五 车８退４',
        '22. 车六平七 象３进１ 23. 车三平二 象１进３ 24. 车二退三 炮２退３',
        '25. 兵五进一 炮２退１ 26. 相三进五 炮２平５ 27. 炮一退一 炮９退１',
        '28. 炮一平三 炮９平７ 29. 炮七退二 车４平６ 30. 炮七平八 象３退１',
        '31. 车二平七 车６平２ 32. 炮八平七 车２平６ 33. 炮七平八 车６平２',
        '34. 炮八平九 车２平６ 35. 炮九进四 马６进８ 36. 炮九平八 象７进５',
        '37. 炮三平四 马８进６ 38. 炮八退三 马６进７ 39. 帅五平四 后马进６',
        '40. 车七平五 卒５进１ 41. 炮八退二 车６进１ 42. 车五平三 炮７平６',
        '43. 炮四进一 马７进９ 44. 车三平二 炮６退１ 45. 炮八进四 马９退７',
        '46. 车二进二 象１进３ 47. 炮八平五 炮５平２ 48. 兵九进一 炮２进１',
        '49. 炮四进一 炮２进１ 50. 仕五进六 炮２进２ 51. 帅四进一 炮２平４',
        '52. 兵九进一 炮４平７ 53. 帅四平五 炮７退２ 54. 炮四进二 炮６进４',
        '55. 马四退三 车６平２ 56. 帅五平四 炮６退４ 57. 车二退四 车２平５',
        '58. 炮五平六 士５进６ 59. 帅四平五 车５平２ 60. 兵九平八 车２平１',
        '61. 兵八平九 车１平２ 62. 兵九平八 车２平１ 63. 兵八平九 1/2-1/2'
      ],
      expect: true
    },
    {
      // pgn without comments behind moves.
      fen: '2b2a3/3ka4/4b4/N8/8p/P5p2/4p4/9/4A4/4KAB2 b - - 0 43',
      pgn: [
        '[Game "Chinese Chess"]',
        '[Event "第一届全运会象棋决赛"]',
        '[Date "1959.??.??"]',
        '[Red "李义庭"]',
        '[Black "王嘉良"]',
        '[Result "1/2-1/2"]',
        '[Opening "五六炮对屏风马先进3卒"]',
        '[ECCO "C70"]',
        '',
        '1.  炮二平五    马８进７   2.  马二进三    卒３进１  ',
        '{黑方进3卒是屏风马应中炮的一种着法。一般认为，这种走法使后手方的作战计划暴露过早，',
        '因此，后手方必须十分熟悉这一布局的变化，才能应付裕如。黑方的用意在于，不让对方先进七兵，因为李义庭对中炮进七兵的布局尤其擅长}',
        '3.  车一平二    车９平８   4.  马八进九  ',
        '{过去，红棋的一方往往走巡河车，然后兑兵，',
        '如王再越在《梅花谱》中所介绍的，现在，这种走法比较不常见了，原因是它的变化已为大家所熟悉，容易成和。',
        '红方上边马之后，一般有炮八平六（五六炮）、炮八平七（五七炮）、炮八进四（五八炮，但须先进三兵）或车九进一的四种变化} ',
        '马２进３ 5.  炮八平六  ',
        '{红方选定五六炮的布局} ',
        '车１平２  ',
        '{黑方一般习见的走法是炮8进2，既防红右车过河，又封红左车，但红方可以进七兵先献，以后升右车捉死卒，红方仍保留先手。',
        '如改应马2进3封车，红方兵三进一，将来有炮六进三打马，黑方马2退3后再炮六进一打卒，一般认为演变下去对红方有利}',
        '6.  车九平八    象７进５  ',
        '{早作马回窝心新颖布局的准备} ',
        '7.  车八进六    卒７进１   8.  车八平七    马３退５  ',
        '{有句老话：“马回中心必定凶”。意思是，回窝心马的一方总是凶多吉少，但这是过去的看法，',
        '建国后象棋布局日新月异，早就打破了前人的常规。黑方不宜走马3进4，否则红炮打士得势}',
        '9.  车二进四  ',
        '{红车巡河比过河车路宽敞，但此时如改走炮五进四，得中卒后，仍有先手。兑去子力以后，局势比现在稍要简单一些。',
        '为谋求复杂变化的条件下斗智，寻找胜利的可能，红方的战术思想是：尽量保持战斗实力，争取主动} ',
        '炮２进５  ',
        '{为削弱红方中路攻势，进炮邀兑，这步棋是明智的}',
        '10. 兵九进一 ',
        '{挺边兵为边马开路，出马以后可以支援左车，是稳步进攻的着法} ',
        '炮８进１ 11. 车七进二    炮２平５   12. 相三进五    车２进３  ',
        '{黑方进车抢占要道，埋伏退炮打死车的阴谋}',
        '13. 马九进八    车２平４   14. 仕六进五    炮８退２   15. 车七退二    车４平３   ',
        '16. 马八进七    炮８平９ ',
        '{现在黑方平炮兑车，已为以后弃子夺先准备条件}',
        '17. 车二平四  ',
        '{红方避兑占四路要道比车二平六稳健。如果改走车二平六，粗看可以得士，但右翼容易受黑方威胁。',
        '如改走车二进五兑车，容易走成和局} ',
        '车８进７   18. 车四进四  ',
        '{这时，棋盘上逐渐出现紧张局势，红方下一步有马七进八准备挂角的杀机} ',
        '马５进３   19. 炮六进五 ',
        '{红方炮打马配合车攻击黑炮，来势汹汹} ',
        '车８平７   ',
        '20. 炮六平三    炮９进５ ',
        '{经过一阵搏杀，黑方实现了弃子夺先的战术计划}',
        '21. 炮三平七    炮９进３   22. 相五退三    车７进２   23. 车四平二    车７退３   ',
        '24. 车二退八    炮９退３  ',
        '{黑方虽失一子，但车炮控制要道，况5卒俱全，乍看起来，红方并不利。观至此，不禁为红方捏把汗}',
        '25. 炮七平八  ',
        '{既可以退炮打中卒，有可以进马压象田，红方此时借对攻达到积极防守的目的}',
        ' 炮９平５  ',
        '{炮轰中兵是棋势复杂化。如改走平车杀中兵，较为平稳，易成和局}',
        '26. 相七进五  ',
        '{经过惊涛骇浪之后，红方谨慎地补上一相。其实，改补相为上士（士五进四），则红方以车马炮单缺相对黑车炮多卒，',
        '谋攻谋和究竟都比较主动。但这时的局势千变万化，一时奥妙难测，在受竞赛时限的条件下要洞察其秘，毕竟是有困难的}',
        ' 炮５退１  ',
        '{黑方退炮后，黑车即将调往右翼，给红方以巨大的威胁} ',
        '27. 马七进六    士４进５   28. 炮八进二  象３进１ 29. 马六退八 将５平４ 30. 马八退六    炮５退１   ',
        '31. 炮八退四    车７平３  32. 炮八平五    卒５进１  ',
        '{为摆脱黑方的威胁，红方在以上几个回合中，马炮协作，以机警细致的着法步步紧迫黑方，终于兑去黑炮，平息了风波。',
        '现在的局势：红方车马兵单缺相，黑方车多卒士象全。以后双方残局着法工稳，终成正和} ',
        '33. 车二进四    车３平４   34. 马六进七    象１退３   35. 车二进二    车４退５   36. 车二平七    卒９进１ ',
        '37. 马七退六    车４平２   38. 车七退一    卒５进１   39. 车七平八    车２进３   40. 马六退八    卒５进１ ',
        '41. 马八进七    将４进１   42. 相五退三    卒７进１   43. 马七退九    1/2-1/2'
      ],
      expect: true
    },
    {
      // Load PGN with comment before first move
      fen: '2R6/5k2C/n8/p1p5p/6b2/6p2/9/9/9/4K4 b - - 0 38',
      pgn: [
        '[Game "Chinese Chess"]',
        '[Event "许银川让九子对聂棋圣"]',
        '[Site "广州"]',
        '[Date "1999.12.09"]',
        '[Red "许银川"]',
        '[Black "聂卫平"]',
        '[Result "1-0"]',
        '[FEN "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/9/1C5C1/9/RN2K2NR r - - 0 1"]',
        '{　　评注：许银川',
        '　　象棋让九子原属茶余饭后的娱乐，不意今日却被摆上赛桌，更为离奇的是：我的对手竟是在围棋棋坛上叱咤风云的聂大帅。赛前我并不了解对手的实力，但相信以聂棋圣在围棋上所体现出来的过人智慧，必能在棋理上触类旁通。因此我在赛前也作了一些准备，在对局中更是小心翼翼，不敢掉以轻心。',
        '　　许银川让去５只兵和双士双相，执红先行。棋盘如右图所示。当然，PGN文件里是无法嵌入图片的。}',
        '',
        '',
        '',
        '1. 炮八平五 炮８平５',
        '{　　红方首着架中炮必走之着，聂棋圣还架中炮拼兑子力，战术对头。}',
        '2. 炮五进五 象７进５ 3. 炮二平五',
        '{　　再架中炮也属正着，如改走马八进七，则象５退７，红方帅府受攻，当然若红方仍再架中炮拼兑，那么失去双炮就难有作用了。}',
        '马８进７ 4. 马二进三 车９平８ 5. 马八进七 马２进１ 6. 车九平六 车１平２',
        '{　　聂棋圣仍按常规战法出动主力，却忽略了红方车塞象眼的凶着，应走车１进１。}',
        '7. 车六进八',
        '{　　红车疾点象眼，局势霎时有剑拔弩张之感。这种对弈不能以常理揣度，红方只能像程咬金的三板斧一般猛攻一轮，若黑方防守得法则胜负立判。}',
        '炮２进７',
        '{　　却说聂棋圣见我来势汹汹，神色顿时颇为凝重，一番思索之后沉下底炮以攻为守，果是身手不凡。此着如改走炮２平３，则帅五平六，炮３进５，车六进一，将５进１，炮五退二，黑方不易驾驭局面。}',
        '8. 车一进四 炮２平１ 9. 马七进八 炮１退４ 10. 马八退七 炮１进４ 11. 马七进八 车２进２',
        '{　　其实黑方仍可走炮１退４，红方若续走马八退七，则仍炮１进４不变作和，因黑右车叫将红可车六退九，故不算犯规。}',
        '12. 炮五平八 炮１退４',
        '{　　劣着，导致失子，应走车２平３，红方如马八进六，则车３退１，红方无从着手。但有一点必须注意，黑车躲进暗道似与棋理相悖，故聂棋圣弃子以求局势缓和情有可原。}',
        '13. 炮八进五 炮１平９ 14. 炮八平三 车８进２ 15. 炮三进一 车８进２ 16. 马八进六 炮９平５',
        '17. 炮三平一 士６进５ 18. 马六进四 车８平５ 19. 帅五平六',
        '{　　可直接走马四进三叫将再踩中象。}',
        '车５平６ 20. 马四进三 将５平６ 21. 车六退四 卒５进１ 22. 车六进二 炮５平７',
        '23. 前马退二 象５进７ 24. 马二退三 卒５进１ 25. 车六平三 卒５平６ 26. 车三进三 将６进１',
        '27. 后马进二 士５进６ 28. 马二进三 将６平５ 29. 前马进二',
        '{　　红方有些拖沓，应直接走车三平六立成绝杀。}',
        '将５进１ 30. 车三平六 士６退５ 31. 马二退三 车６退１ 32. 车六退三',
        '{　　再擒一车，以下着法仅是聊尽人事而已。}',
        '车６平７ 33. 车六平三 卒６平７ 34. 车三平五 将５平６ 35. 帅六平五 将６退１',
        '36. 车五进二 将６退１ 37. 车五进一 将６进１ 38. 车五平七',
        '{　　至此，聂棋圣认负。与此同时，另一盘围棋对弈我被屠去一条大龙，已无力再战，遂平分秋色，皆大欢喜。}',
        '1-0'
      ],
      expect: true
    },
    // regression test - broken PGN parser ended up here:
    // fen = rnbqk2r/pp1p1ppp/4pn2/1N6/1bPN4/8/PP2PPPP/R1BQKB1R b KQkq - 2 6
    {pgn: ['1. d4 Nf6 2. c4 e6 3. Nf3 c5 4. Nc3 cxd4 5. Nxd4 Bb4 6. Nb5'],
     fen: 'rnbqk2r/pp1p1ppp/4pn2/1N6/1bP5/2N5/PP2PPPP/R1BQKB1R b KQkq - 2 6',
     expect: true},
    {pgn: ['1. e4 Qxd7 1/2-1/2'],
     expect: false},
    // variation test (with comments behind moves)
    {pgn: ['1. e4 ( 1. d4 { Queen\'s pawn } d5 ( 1... Nf6 ) ) e5'],
     fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR r KQkq e6 0 2',
     expect: true
    },
    {pgn: [
      '1. e4 c5 2. Nf3 e6 { Sicilian Defence, French Variation } 3. Nc3 a6',
      '4. Be2 Nc6 5. d4 cxd4 6. Nxd4 Qc7 7. O-O Nf6 8. Be3 Be7 9. f4 d6',
      '10. Kh1 O-O 11. Qe1 Nxd4 12. Bxd4 b5 13. Qg3 Bb7 14. a3 Rad8',
      '15. Rae1 Rd7 16. Bd3 Qd8 17. Qh3 g6? { (0.05 → 1.03) Inaccuracy.',
      'The best move was h6. } (17... h6 18. Rd1 Re8 19. Qg3 Nh5 20. Qg4',
      'Nf6 21. Qh3 Bc6 22. Kg1 Qb8 23. Qg3 Nh5 24. Qf2 Bf6 25. Be2 Bxd4',
      '26. Rxd4 Nf6 27. g3) 18. f5 e5'],
     fen: '3q1rk1/1b1rbp1p/p2p1np1/1p2pP2/3BP3/P1NB3Q/1PP3PP/4RR1K r - - 0 19',
     expect: true},
    {pgn: [
      '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bb6 5. a4 a6 6. c3 Nf6 7. d3 d6',
      '8. Nbd2 O-O 9. O-O Ne7 10. d4 Ng6 11. dxe5 Nxe5 12. Nxe5 dxe5 13. Qb3 Ne8',
      '14. Nf3 Nd6 15. Rd1 Bg4 16. Be2 Qf6 17. c4 Bxf3 18. Bxf3 Bd4 19. Rb1 b5 $2',
      '20. c5 Nc4 21. Rf1 Qg6 22. Qc2 c6 23. Be2 Rfd8 24. a5 h5 $2 (24... Rd7 $11)',
      '25. Rb3 $1 h4 26. Rh3 Qf6 27. Rf3'],
     fen: 'r2r2k1/5pp1/p1p2q2/PpP1p3/1PnbP2p/5R2/2Q1BPPP/2B2RK1 b - - 3 27',
     expect: true},
    {pgn: [
      '1. d4 d5 2. Bf4 Nf6 3. e3 g6 4. Nf3 (4. Nc3 Bg7 5. Nf3 O-O 6. Be2 c5)',
      '4... Bg7 5. h3 { 5. Be2 O-O 6. O-O c5 7. c3 Nc6 } 5... O-O'],
     fen: 'rnbq1rk1/ppp1ppbp/5np1/3p4/3P1B2/4PN1P/PPP2PP1/RN1QKB1R r KQ - 1 6',
     expect: true},

    // test the sloppy PGN parser
    {pgn: [
      '1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.dxe5 Bxf3 5.Qxf3 dxe5 6.Qf5 Nc6 7.Bb5 Nge7',
      '8.Qxe5 Qd7 9.O-O Nxe5 10.Bxd7+ Nxd7 11.Rd1 O-O-O 12.Nc3 Ng6 13.Be3 a6',
      '14.Ba7 b6 15.Na4 Kb7 16.Bxb6 cxb6 17.b3 b5 18.Nb2 Nge5 19.f3 Rc8',
      '20.Rac1 Ba3 21.Rb1 Rxc2 22.f4 Ng4 23.Rxd7+ Kc6 24.Rxf7 Bxb2 25.Rxg7',
      'Ne3 26.Rg3 Bd4 27.Kh1 Rxa2 28.Rc1+ Kb6 29.e5 Rf8 30.e6 Rxf4 31.e7 Re4',
      '32.Rg7 Bxg7'],
      fen: '8/4P1bp/pk6/1p6/4r3/1P2n3/r5PP/2R4K r - - 0 33',
      expect: false,
      sloppy: false},

    {pgn: [
      '1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.dxe5 Bxf3 5.Qxf3 dxe5 6.Qf5 Nc6 7.Bb5 Nge7',
      '8.Qxe5 Qd7 9.O-O Nxe5 10.Bxd7+ Nxd7 11.Rd1 O-O-O 12.Nc3 Ng6 13.Be3 a6',
      '14.Ba7 b6 15.Na4 Kb7 16.Bxb6 cxb6 17.b3 b5 18.Nb2 Nge5 19.f3 Rc8',
      '20.Rac1 Ba3 21.Rb1 Rxc2 22.f4 Ng4 23.Rxd7+ Kc6 24.Rxf7 Bxb2 25.Rxg7',
      'Ne3 26.Rg3 Bd4 27.Kh1 Rxa2 28.Rc1+ Kb6 29.e5 Rf8 30.e6 Rxf4 31.e7 Re4',
      '32.Rg7 Bxg7'],
      fen: '8/4P1bp/pk6/1p6/4r3/1P2n3/r5PP/2R4K r - - 0 33',
      expect: true,
      sloppy: true},


    // the sloppy PGN parser should still accept correctly disambiguated moves
    {pgn: [
      '1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.dxe5 Bxf3 5.Qxf3 dxe5 6.Qf5 Nc6 7.Bb5 Ne7',
      '8.Qxe5 Qd7 9.O-O Nxe5 10.Bxd7+ Nxd7 11.Rd1 O-O-O 12.Nc3 Ng6 13.Be3 a6',
      '14.Ba7 b6 15.Na4 Kb7 16.Bxb6 cxb6 17.b3 b5 18.Nb2 Nge5 19.f3 Rc8',
      '20.Rac1 Ba3 21.Rb1 Rxc2 22.f4 Ng4 23.Rxd7+ Kc6 24.Rxf7 Bxb2 25.Rxg7',
      'Ne3 26.Rg3 Bd4 27.Kh1 Rxa2 28.Rc1+ Kb6 29.e5 Rf8 30.e6 Rxf4 31.e7 Re4',
      '32.Rg7 Bxg7'],
      fen: '8/4P1bp/pk6/1p6/4r3/1P2n3/r5PP/2R4K r - - 0 33',
      expect: true,
      sloppy: true},

    {pgn: [
      '1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 d5 5.exd5 Nxd5 6.Nxf7 Kxf7 7.Qf3+',
      'Ke6 8.Nc3 Nb4'],
      fen: 'r1bq1b1r/ppp3pp/4k3/3np3/1nB5/2N2Q2/PPPP1PPP/R1B1K2R r KQ - 4 9',
      expect: true,
      sloppy: true
    },


    // the sloppy parser should handle lazy disambiguation (e.g. Rc1c4 below)
    {pgn: [
      '1.e4 e5 2. Nf3 d5 3. Nxe5 f6 4. Bb5+ c6 5. Qh5+ Ke7',
      'Qf7+ Kd6 7. d3 Kxe5 8. Qh5+ g5 9. g3 cxb5 10. Bf4+ Ke6',
      'exd5+ Qxd5 12. Qe8+ Kf5 13. Rg1 gxf4 14. Nc3 Qc5 15. Ne4 Qxf2+',
      'Kxf2 fxg3+ 17. Rxg3 Nd7 18. Qh5+ Ke6 19. Qe8+ Kd5 20. Rg4 Rb8',
      'c4+ Kc6 22. Qe6+ Kc7 23. cxb5 Ne7 24. Rc1+ Kd8 25. Nxf6 Ra8',
      'Kf1 Rb8 27. Rc1c4 b6 28. Rc4-d4 Rb7 29. Qf7 Rc7 30. Qe8# 1-0'],
      fen: '2bkQb1r/p1rnn2p/1p3N2/1P6/3R2R1/3P4/PP5P/5K2 b - - 5 30',
      expect: true,
      sloppy: true
    },

    // sloppy parse should parse long algebraic notation
    {pgn: [
      'e2e4 d7d5 e4d5 d8d5 d2d4 g8f6 c2c4 d5d8 g1f3 c8g4 f1e2 e7e6 b1c3 f8e7',
      'c1e3 e8g8 d1b3 b8c6 a1d1 a8b8 e1g1 d8c8 h2h3 g4h5 d4d5 e6d5 c4d5 h5f3',
      'e2f3 c6e5 f3e2 a7a6 e3a7 b8a8 a7d4 e7d6 b3c2 f8e8 f2f4 e5d7 e2d3 c7c5',
      'd4f2 d6f4 c3e4 f6d5 e4d6 f4d6 d3h7'],
      fen: 'r1q1r1k1/1p1n1ppB/p2b4/2pn4/8/7P/PPQ2BP1/3R1RK1 b - - 0 25',
      expect: true,
      sloppy: true,
    },

    // sloppy parse should parse extended long algebraic notation w/ en passant
    {pgn: [
      '1. d2d4 f7f5 2. b2b3 e7e6 3. c1b2 d7d5 4. g1f3 f8d6 5. e2e3 g8f6 6. b1d2',
      'e8g8 7. c2c4 c7c6 8. f1d3 b8d7 9. e1g1 f6e4 10. a1c1 g7g5 11. h2h3 d8e8 12.',
      'd3e4 d5e4 13. f3g5 e8g6 14. h3h4 h7h6 15. g5h3 d7f6 16. f2f4 e4f3 17. d2f3',
      'f6g4 18. d1e2 d6g3 19. h3f4 g6g7 20. d4d5 g7f7 21. d5e6 c8e6 22. f3e5 g4e5',
      '23. b2e5 g8h7 24. h4h5 f8g8 25. e2f3 g3f4 26. e5f4 g8g4 27. g2g3 a8g8 28.',
      'c1c2 b7b5 29. c4b5 e6d5 30. f3d1 f7h5 31. c2h2 g4g3+ 32. f4g3 g8g3+ 33.',
      'g1f2 h5h2+ 34. f2e1 g3g2 35. d1d3 d5e4 36. d3d7+ h7g6 37. b5c6 g2e2+ 38.',
      'e1d1 e2a2 0-1'],
      fen: '8/p2Q4/2P3kp/5p2/4b3/1P2P3/r6q/3K1R2 r - - 0 39',
      expect: true,
      sloppy: true
    },

    // sloppy parse should parse long algebraic notation w/ unders
    {pgn: [
      '1. e2e4 c7c5 2. g1f3 d7d6 3. d2d4 c5d4 4. f3d4 g8f6 5. f1d3 a7a6 6. c1e3',
      'e7e5 7. d4f5 c8f5 8. e4f5 d6d5 9. e3g5 f8e7 10. d1e2 e5e4 11. g5f6 e7f6 12.',
      'd3e4 d5e4 13. e2e4+ d8e7 14. e4e7+ f6e7 15. e1g1 e8g8 16. f1e1 e7f6 17.',
      'c2c3 b8c6 18. b1d2 a8d8 19. d2e4 f8e8 20. e1e3 c6e5 21. a1e1 e5d3 22. e4f6+',
      'g7f6 23. e3e8+ d8e8 24. e1e8+ g8g7 25. b2b4 d3e5 26. a2a4 b7b5 27. a4b5',
      'a6b5 28. e8b8 e5g4 29. b8b5 g4e5 30. b5c5 g7f8 31. b4b5 f8e7 32. f2f4 e5d7',
      '33. c5c7 e7d6 34. c7c8 d7b6 35. c8c6+ d6d7 36. c6b6 h7h5 37. b6f6 h5h4 38.',
      'f6f7+ d7d6 39. f7h7 h4h3 40. h7h3 d6e7 41. b5b6 e7f6 42. h3h5 f6g7 43. b6b7',
      'g7g8 44. b7b8N g8g7 45. c3c4 g7f6 46. c4c5 f6e7 47. c5c6 e7f6 48. c6c7 f6e7',
      '49. c7c8B e7d6 50. b8a6 d6e7 51. c8e6 e7f6 52. a6c5 f6g7 53. c5e4 g7f8 54.',
      'h5h8+ f8g7 55. h8g8+ g7h6 56. g8g6+ h6h7 57. e4f6+ h7h8 58. f6e4 h8h7 59.',
      'f5f6 h7g6 60. f6f7 g6h5 61. f7f8R h5h6 62. f4f5 h6h7 63. f8f7+ h7h6 64.',
      'f5f6 h6g6 65. f7g7+ g6h5 66. f6f7 h5h4 67. f7f8Q h4h5 68. f8h8# 1-0'],
      fen: '7Q/6R1/4B3/7k/4N3/8/6PP/6K1 b - - 2 68',
      expect: true,
      sloppy: true
    },

    // sloppy parse should parse abbreviated long algebraic notation
    {pgn: [
      '1. d2d4 f7f5 2. Bc1g5 d7d6 3. e2e3 Nb8d7 4. c2c4 Ng8f6 5. Nb1c3 e7e5 6.',
      'd4e5 d6e5 7. g2g3 Bf8e7 8. Bf1h3 h7h6 9. Bg5f6 Nd7f6 10. Qd1d8+ Be7d8 11.',
      'Ng1f3 e5e4 12. Nf3d4 g7g6 13. e1g1 c7c5 14. Nd4b5 e8g8 15. Nb5d6 Bd8c7 16.',
      'Nd6c8 Ra8c8 17. Rf1d1 Rc8d8 18. Bh3f1 b7b6 19. Nc3d5 Nf6d5 20. c4d5 Rf8e8',
      '21. Bf1b5 Re8e5 22. Bb5c6 Kg8f7 23. Kg1f1 Kf7f6 24. h2h4 g6g5 25. h4g5+',
      'h6g5 26. Kf1e2 Rd8h8 27. Rd1h1 Rh8h1 28. Ra1h1 Kf6g7 29. Rh1h5 Kg7g6 30.',
      'Rh5h8 Re5e7 31. Rh8a8 a7a5 32. Ra8a7 Kg6f6 33. Ra7b7 Kf6e5 34. Ke2d2 f5f4',
      '35. g3f4+ g5f4 36. Kd2c3 f4e3 37. f2e3 Re7f7 38. Kc3c4 Ke5d6 39. a2a3 Rf7f3',
      '40. b2b4 a5b4 41. a3b4 c5b4 42. Kc4b4 Rf3e3 43. Kb4c4 Re3a3 44. Kc4b4 e4e3',
      '45. Bc6b5 Ra3a1 46. Kb4c3 Ra1a3+ 47. Kc3d4 Ra3b3 48. Bb5e2 Rb3b4+ 49. Kd4e3',
      'Rb4h4 50. Be2f3 Rh4h3 51. Rb7a7 Rh3f3+ 52. Ke3f3 b6b5 53. Kf3e4 Kd6c5 54.',
      'Ra7b7 Bc7b6 55. Ke4e5 b5b4 56. d5d6 b4b3 57. Rb7b6 Kc5b6 58. d6d7 Kb6c7 59.',
      'Ke5e6 1-0'],
      fen: '8/2kP4/4K3/8/8/1p6/8/8 b - - 2 59',
      expect: true,
      sloppy: true
    },

    // sloppy parse should parse extended long algebraic notation
    {pgn: [
      '1. e2-e4 c7-c5 2. Ng1-f3 d7-d6 3. d2-d4 c5xd4 4. Nf3xd4 Ng8-f6 5. Bf1-d3',
      'a7-a6 6. Bc1-e3 e7-e5 7. Nd4-f5 Bc8xf5 8. e4xf5 d6-d5 9. Be3-g5 Bf8-e7 10.',
      'Qd1-e2 e5-e4 11. Bg5xf6 Be7xf6 12. Bd3xe4 d5xe4 13. Qe2xe4+ Qd8-e7 14.',
      'Qe4xe7+ Bf6xe7 15. e1-g1 e8-g8 16. Rf1-e1 Be7-f6 17. c2-c3 Nb8-c6 18.',
      'Nb1-d2 Ra8-d8 19. Nd2-e4 Rf8-e8 20. Re1-e3 Nc6-e5 21. Ra1-e1 Ne5-d3 22.',
      'Ne4xf6+ g7xf6 23. Re3xe8+ Rd8xe8 24. Re1xe8+ Kg8-g7 25. b2-b4 Nd3-e5 26.',
      'a2-a4 b7-b5 27. a4xb5 a6xb5 28. Re8-b8 Ne5-g4 29. Rb8xb5 Ng4-e5 30. Rb5-c5',
      'Kg7-f8 31. b4-b5 Kf8-e7 32. f2-f4 Ne5-d7 33. Rc5-c7 Ke7-d6 34. Rc7-c8',
      'Nd7-b6 35. Rc8-c6+ Kd6-d7 36. Rc6xb6 h7-h5 37. Rb6xf6 h5-h4 38. Rf6xf7+',
      'Kd7-d6 39. Rf7-h7 h4-h3 40. Rh7xh3 Kd6-e7 41. b5-b6 Ke7-f6 42. Rh3-h5',
      'Kf6-g7 43. b6-b7 Kg7-g8 44. b7-b8N Kg8-g7 45. c3-c4 Kg7-f6 46. c4-c5 Kf6-e7',
      '47. c5-c6 Ke7-f6 48. c6-c7 Kf6-e7 49. c7-c8B Ke7-d6 50. Nb8-a6 Kd6-e7 51.',
      'Bc8-e6 Ke7-f6 52. Na6-c5 Kf6-g7 53. Nc5-e4 Kg7-f8 54. Rh5-h8+ Kf8-g7 55.',
      'Rh8-g8+ Kg7-h6 56. Rg8-g6+ Kh6-h7 57. Ne4-f6+ Kh7-h8 58. Nf6-e4 Kh8-h7 59.',
      'f5-f6 Kh7xg6 60. f6-f7 Kg6-h5 61. f7-f8R Kh5-h6 62. f4-f5 Kh6-h7 63.',
      'Rf8-f7+ Kh7-h6 64. f5-f6 Kh6-g6 65. Rf7-g7+ Kg6-h5 66. f6-f7 Kh5-h4 67.',
      'f7-f8Q Kh4-h5 68. Qf8-h8# 1-0'],
      fen: '7Q/6R1/4B3/7k/4N3/8/6PP/6K1 b - - 2 68',
      expect: true,
      sloppy: true
    },
  ];

  var newline_chars = ['\n', '<br />', '\r\n', 'BLAH'];

  tests.forEach(function(t, i) {
    newline_chars.forEach(function(newline, j) {
      it(i + String.fromCharCode(97 + j), function() {
        var sloppy = t.sloppy || false;
        var result = xiangqi.load_pgn(t.pgn.join(newline), {sloppy: sloppy,
                                                          newline_char: newline});
        var should_pass = t.expect;

        // some tests are expected to fail
        if (should_pass) {

        // some PGN's tests contain comments which are stripped during parsing,
        // so we'll need compare the results of the load against a FEN string
        // (instead of the reconstructed PGN [e.g. test.pgn.join(newline)])
          if ('fen' in t) {
            assert(result && xiangqi.fen() === t.fen);
          } else {
            assert(result && xiangqi.pgn({ max_width: 65, newline_char: newline }) === t.pgn.join(newline));
          }

        } else {
          // this test should fail, so make sure it does
          assert(result === should_pass);
        }
      });

    });

  });

  // special case dirty file containing a mix of \n and \r\n
  it('dirty pgn', function() {
    var pgn =
         '[Event "1982年全国赛"]\n' +
         '[Date "1982.12.11"]\n' +
         '[Result "1/2-1/2"]\n' +
         '[Red "柳大华"]\r\n' +
         '[Black "杨官璘"]\n' +
         '\r\n' +
         '1.  炮八平五 马２进３ 2.  马八进七 车１平２ 3.  车九平八 马８进７\n' +
         '4.  兵三进一 卒３进１ 5.  车八进六 炮２平１ 6.  车八平七 炮１退１\n' +
         '7.  马二进三 士６进５ 8.  炮二平一 炮１平３ 9.  车七平六 马３进２\n' +
         '10. 车一平二 车９平８ 11. 马七退五 卒３进１ 12. 车六退一 炮３进５\r\n' +
         '13. 车二进六 马２进４ 14. 炮五平七 车２进２ 15. 炮七进二 车２平４\n' +
         '16. 马三进四 炮８平９ 17. 车二平三 车８进７ 18. 兵三进一 炮３平２\n' +
         '19. 兵三平四 炮２进３ 20. 马五进三 马４退６ 21. 仕四进五 车８退４\n' +
         '22. 车六平七 象３进１ 23. 车三平二 象１进３ 24. 车二退三 炮２退３\n' +
         '25. 兵五进一 炮２退１ 26. 相三进五 炮２平５ 27. 炮一退一 炮９退１\n' +
         '28. 炮一平三 炮９平７ 29. 炮七退二 车４平６ 30. 炮七平八 象３退１\n' +
         '31. 车二平七 车６平２ 32. 炮八平七 车２平６ 33. 炮七平八 车６平２\n' +
         '34. 炮八平九 车２平６ 35. 炮九进四 马６进８ 36. 炮九平八 象７进５\r\n' +
         '37. 炮三平四 马８进６ 38. 炮八退三 马６进７ 39. 帅五平四 后马进６\n' +
         '40. 车七平五 卒５进１ 41. 炮八退二 车６进１ 42. 车五平三 炮７平６\n' +
         '43. 炮四进一 马７进９ 44. 车三平二 炮６退１ 45. 炮八进四 马９退７\n' +
         '46. 车二进二 象１进３ 47. 炮八平五 炮５平２ 48. 兵九进一 炮２进１\n' +
         '49. 炮四进一 炮２进１ 50. 仕五进六 炮２进２ 51. 帅四进一 炮２平４\n' +
         '52. 兵九进一 炮４平７ 53. 帅四平五 炮７退２ 54. 炮四进二 炮６进４\n' +
         '55. 马四退三 车６平２ 56. 帅五平四 炮６退４ 57. 车二退四 车２平５\n' +
         '58. 炮五平六 士５进６ 59. 帅四平五 车５平２ 60. 兵九平八 车２平１\r\n' +
         '61. 兵八平九 车１平２ 62. 兵九平八 车２平１ 63. 兵八平九 1/2-1/2';

    var result = xiangqi.load_pgn(pgn, { newline_char: '\r?\n' });
    assert(result);

    assert(xiangqi.load_pgn(pgn));
    assert(xiangqi.pgn().match(/^\[\[/) === null);
  });

});
*/

describe('PGN (ICCS Format)', function() {

  var passed = true;
  var error_message;
  var positions = [
    {
      moves: [  'h2e2', 'h9g7', 'h0g2', 'i9h9', 'g3g4', 'h7i7', 'b0c2', 'c6c5', 'b2b6', 'b9c7', 'b6c6', 'a9b9', 'a0b0',
        'c9e7', 'b0b4', 'h9h5', 'c6g6', 'b7a7', 'b4b9', 'c7b9', 'i0i1', 'b9c7', 'i1b1', 'c7d5', 'b1b4', 'd5c3', 'g6a6',
        'h5d5', 'd0e1', 'd5d6', 'a6a5', 'd6c6', 'c0a2', 'a7c7', 'a5a9', 'c7c9', 'g2f4', 'c6a6', 'a9b9', 'c3e2', 'g0e2',
        'i7i3', 'f4d5', 'a6a8', 'a2c0', 'a8d8', 'd5f6', 'd8f8', 'b4f4', 'g7e8', 'g4g5', 'e8c7', 'b9a9', 'c7b9', 'a9c9',
        'e7c9', 'g5g6', 'b9c7', 'f4d4', 'f8f7', 'a3a4', 'f9e8', 'e2g0', 'c5c4', 'd4c4', 'c7d5', 'f6g4', 'i3g3', 'g4h6',
        'd5f4', 'c0e2', 'g9e7', 'c4e4', 'g3h3', 'g6g7', 'f7f6', 'h6g4', 'f6f5', 'e4e6', 'f5g5', 'e6h6', 'h3g3', 'e1d2',
        'g5g7', 'h6h3', 'g3g1', 'e3e4', 'g1f1', 'h3e3', 'g7g5', 'e4e5', 'i6i5', 'c2d4', 'i5i4', 'g4h2', 'f4g2', 'e3f3',
        'f1d1', 'd4f5', 'i4h4', 'f3f1', 'h4h3', 'h2i0', 'g2h4', 'f1d1', 'h4f5', 'e5f5', 'g5f5', 'i0g1', 'h3g3', 'g1i2',
        'g3h3', 'd1a1', 'f5f4', 'i2g1', 'h3g3', 'e2c0', 'f4e4', 'g1e2', 'g3f3', 'd2e1', 'f3e3', 'e2g3', 'e4g4', 'g3f1',
        'e3f3', 'f1h2', 'g4f4', 'a1a3', 'f3g3', 'c0e2', 'g3h3', 'h2f3', 'h3g3', 'f3d2', 'f4f3', 'a3a1', 'f3d3', 'a4a5',
        'g3f3', 'a1a4', 'f3e3', 'a4e4'],
      header: ['Game', 'Chinese Chess', 'Event', '第24届“五羊杯”全国冠军邀请赛', 'Site', '广州', 'Date', '2004.01.05',
        'Round', '决赛(加赛)', 'RedTeam', '广州', 'Red', '吕钦', 'BlackTeam', '广州', 'Black', '许银川', 'Result', '1-0',
        'Opening', '中炮过河炮对左三步虎', 'ECCO', 'B24', 'Format', 'ICCS'],
      max_width:15,
      newline_char:'<br />',
      pgn: '[Game "Chinese Chess"]<br />[Event "第24届“五羊杯”全国冠军邀请赛"]<br />[Site "广州"]<br />[Date "2004.01.05"]<br />' +
        '[Round "决赛(加赛)"]<br />[RedTeam "广州"]<br />[Red "吕钦"]<br />[BlackTeam "广州"]<br />[Black "许银川"]<br />' +
        '[Result "1-0"]<br />[Opening "中炮过河炮对左三步虎"]<br />[ECCO "B24"]<br />[Format "ICCS"]<br /><br />' +
        '1. h2e2 h9g7<br />2. h0g2 i9h9<br />3. g3g4 h7i7<br />4. b0c2 c6c5<br />5. b2b6 b9c7<br />6. b6c6 a9b9<br />' +
        '7. a0b0 c9e7<br />8. b0b4 h9h5<br />9. c6g6 b7a7<br />10. b4b9 c7b9<br />11. i0i1 b9c7<br />12. i1b1 c7d5<br />' +
        '13. b1b4 d5c3<br />14. g6a6 h5d5<br />15. d0e1 d5d6<br />16. a6a5 d6c6<br />17. c0a2 a7c7<br />18. a5a9 c7c9<br />' +
        '19. g2f4 c6a6<br />20. a9b9 c3e2<br />21. g0e2 i7i3<br />22. f4d5 a6a8<br />23. a2c0 a8d8<br />24. d5f6 d8f8<br />' +
        '25. b4f4 g7e8<br />26. g4g5 e8c7<br />27. b9a9 c7b9<br />28. a9c9 e7c9<br />29. g5g6 b9c7<br />30. f4d4 f8f7<br />' +
        '31. a3a4 f9e8<br />32. e2g0 c5c4<br />33. d4c4 c7d5<br />34. f6g4 i3g3<br />35. g4h6 d5f4<br />36. c0e2 g9e7<br />' +
        '37. c4e4 g3h3<br />38. g6g7 f7f6<br />39. h6g4 f6f5<br />40. e4e6 f5g5<br />41. e6h6 h3g3<br />42. e1d2 g5g7<br />' +
        '43. h6h3 g3g1<br />44. e3e4 g1f1<br />45. h3e3 g7g5<br />46. e4e5 i6i5<br />47. c2d4 i5i4<br />48. g4h2 f4g2<br />' +
        '49. e3f3 f1d1<br />50. d4f5 i4h4<br />51. f3f1 h4h3<br />52. h2i0 g2h4<br />53. f1d1 h4f5<br />54. e5f5 g5f5<br />' +
        '55. i0g1 h3g3<br />56. g1i2 g3h3<br />57. d1a1 f5f4<br />58. i2g1 h3g3<br />59. e2c0 f4e4<br />60. g1e2 g3f3<br />' +
        '61. d2e1 f3e3<br />62. e2g3 e4g4<br />63. g3f1 e3f3<br />64. f1h2 g4f4<br />65. a1a3 f3g3<br />66. c0e2 g3h3<br />' +
        '67. h2f3 h3g3<br />68. f3d2 f4f3<br />69. a3a1 f3d3<br />70. a4a5 g3f3<br />71. a1a4 f3e3<br />72. a4e4 1-0',
      fen: '2bak4/4a4/4b4/9/P8/4R4/3rp4/3NB4/4A4/4KAB2 b - - 35 72'
    },
    {
      moves: [  'b2e2', 'b9c7', 'b0c2', 'a9b9', 'a0b0', 'h9g7', 'g3g4', 'c6c5', 'b0b6', 'b7a7', 'b6c6', 'a7a8', 'h0g2',
        'f9e8', 'h2i2', 'a8c8', 'c6d6', 'c7b5', 'i0h0', 'i9h9', 'c2e1', 'c5c4', 'd6d5', 'c8c3', 'h0h6', 'b5d4', 'e2c2',
        'b9b7', 'c2c4', 'b7d7', 'g2f4', 'h7i7', 'h6g6', 'h9h2', 'g4g5', 'c3b3', 'g5f5', 'b3b0', 'e1g2', 'd4f5', 'f0e1',
        'h2h6', 'd5c5', 'c9a7', 'g6h6', 'a7c5', 'h6h3', 'b0b3', 'e3e4', 'b3b4', 'g0e2', 'b4e4', 'i2i1', 'i7i8', 'i1g1',
        'i8g8', 'c4c2', 'd7f7', 'c2b2', 'c5a7', 'h3c3', 'f7b7', 'b2c2', 'b7f7', 'c2b2', 'f7b7', 'b2a2', 'b7f7', 'a2a6',
        'f5h4', 'a6b6', 'g9e7', 'g1f1', 'h4f3', 'b6b3', 'f3g1', 'e0f0', 'g7f5', 'c3e3', 'e6e5', 'b3b1', 'f7f6', 'e3g3',
        'g8f8', 'f1f2', 'g1i0', 'g3h3', 'f8f9', 'b1b5', 'i0g1', 'h3h5', 'a7c5', 'b5e5', 'e4b4', 'a3a4', 'b4b3', 'f2f3',
        'b3b2', 'e1d2', 'b2b0', 'f0f1', 'b0d0', 'a4a5', 'd0g0', 'f1e1', 'g0g2', 'f3f5', 'f9f5', 'f4g2', 'f6b6', 'e1f1',
        'f5f9', 'h5h1', 'b6e6', 'e5d5', 'e8f7', 'f1e1', 'e6b6', 'a5b5', 'b6a6', 'b5a5', 'a6b6', 'a5b5', 'b6a6', 'b5a5'],
      header: ['Game', 'Chinese Chess', 'Event', '1982年全国赛', 'Date', '1982.12.11',
        'Red', '柳大华', 'Black', '杨官璘', 'Result', '1/2-1/2', 'Format', 'ICCS'],
      max_width:45,
      pgn: '[Game "Chinese Chess"]\n[Event "1982年全国赛"]\n[Date "1982.12.11"]\n' +
        '[Red "柳大华"]\n[Black "杨官璘"]\n[Result "1/2-1/2"]\n[Format "ICCS"]\n\n' +
        '1. b2e2 b9c7 2. b0c2 a9b9 3. a0b0 h9g7\n4. g3g4 c6c5 5. b0b6 b7a7 6. b6c6 a7a8\n' +
        '7. h0g2 f9e8 8. h2i2 a8c8 9. c6d6 c7b5\n10. i0h0 i9h9 11. c2e1 c5c4 12. d6d5 c8c3\n' +
        '13. h0h6 b5d4 14. e2c2 b9b7 15. c2c4 b7d7\n16. g2f4 h7i7 17. h6g6 h9h2 18. g4g5 c3b3\n' +
        '19. g5f5 b3b0 20. e1g2 d4f5 21. f0e1 h2h6\n22. d5c5 c9a7 23. g6h6 a7c5 24. h6h3 b0b3\n' +
        '25. e3e4 b3b4 26. g0e2 b4e4 27. i2i1 i7i8\n28. i1g1 i8g8 29. c4c2 d7f7 30. c2b2 c5a7\n' +
        '31. h3c3 f7b7 32. b2c2 b7f7 33. c2b2 f7b7\n34. b2a2 b7f7 35. a2a6 f5h4 36. a6b6 g9e7\n' +
        '37. g1f1 h4f3 38. b6b3 f3g1 39. e0f0 g7f5\n40. c3e3 e6e5 41. b3b1 f7f6 42. e3g3 g8f8\n' +
        '43. f1f2 g1i0 44. g3h3 f8f9 45. b1b5 i0g1\n46. h3h5 a7c5 47. b5e5 e4b4 48. a3a4 b4b3\n' +
        '49. f2f3 b3b2 50. e1d2 b2b0 51. f0f1 b0d0\n52. a4a5 d0g0 53. f1e1 g0g2 54. f3f5 f9f5\n' +
        '55. f4g2 f6b6 56. e1f1 f5f9 57. h5h1 b6e6\n58. e5d5 e8f7 59. f1e1 e6b6 60. a5b5 b6a6\n' +
        '61. b5a5 a6b6 62. a5b5 b6a6 63. b5a5 1/2-1/2',
      fen: '3akc3/9/4ba3/r7p/P1bC5/9/8P/3AB1N2/4K1nR1/2B6 b - - 16 63'
    },
    {
      moves: ['h2e2', 'h9g7', 'h0g2', 'i9h9'],     // testing max_width being small and having no comments
      header: [],
      max_width:1,
      pgn: '1. h2e2 h9g7\n2. h0g2 i9h9',
      fen: 'rnbakabr1/9/1c4nc1/p1p1p1p1p/9/9/P1P1P1P1P/1C2C1N2/9/RNBAKAB1R r - - 4 3'
    },
    {
      moves: ['h7i7', 'b0c2', 'c6c5', 'b2b6'],     // testing a non-starting position
      header: [],
      max_width:25,
      pgn: '[FEN "rnbakabr1/9/1c4nc1/p1p1p1p1p/9/6P2/P1P1P3P/1C2C1N2/9/RNBAKAB1R b - - 5 3"]\n\n3. ... h7i7 4. b0c2 c6c5\n5. b2b6',
      starting_position: 'rnbakabr1/9/1c4nc1/p1p1p1p1p/9/6P2/P1P1P3P/1C2C1N2/9/RNBAKAB1R b - - 5 3',
      fen: 'rnbakabr1/9/1c4n1c/pC2p1p1p/2p6/6P2/P1P1P3P/2N1C1N2/9/R1BAKAB1R b - - 9 5'
    }
  ];

  positions.forEach(function(position, i) {

    it(i.toString(), function() {
      var xiangqi = ('starting_position' in position) ? new Xiangqi(position.starting_position) : new Xiangqi();
      passed = true;
      error_message = '';
      for (var j = 0; j < position.moves.length; j++) {
        if (xiangqi.move(position.moves[j]) === null) {
          error_message = 'move() did not accept ' + position.moves[j] + ' : ';
          break;
        }
      }

      xiangqi.header.apply(null, position.header);
      var pgn = xiangqi.pgn({max_width:position.max_width, newline_char:position.newline_char});
      var fen = xiangqi.fen();
      passed = pgn === position.pgn && fen === position.fen;
      assert(passed && error_message.length === 0);
    });

  });

});


describe('Load PGN (ICCS Format)', function() {

  var xiangqi = new Xiangqi();
  var tests = [
    {
      pgn: [
        '[Game "Chinese Chess"]',
        '[Event "第24届“五羊杯”全国冠军邀请赛"]',
        '[Site "广州"]',
        '[Date "2004.01.05"]',
        '[Round "决赛(加赛)"]',
        '[RedTeam "广州"]',
        '[Red "吕钦"]',
        '[BlackTeam "广州"]',
        '[Black "许银川"]',
        '[Result "1-0"]',
        '[Opening "中炮过河炮对左三步虎"]',
        '[ECCO "B24"]',
        '[Format "ICCS"]',
        '',
        '1. h2e2 h9g7 2. h0g2 i9h9 3. g3g4 h7i7',
        '4. b0c2 c6c5 5. b2b6 b9c7 6. b6c6 a9b9',
        '7. a0b0 c9e7 8. b0b4 h9h5 9. c6g6 b7a7',
        '10. b4b9 c7b9 11. i0i1 b9c7 12. i1b1 c7d5',
        '13. b1b4 d5c3 14. g6a6 h5d5 15. d0e1 d5d6',
        '16. a6a5 d6c6 17. c0a2 a7c7 18. a5a9 c7c9',
        '19. g2f4 c6a6 20. a9b9 c3e2 21. g0e2 i7i3',
        '22. f4d5 a6a8 23. a2c0 a8d8 24. d5f6 d8f8',
        '25. b4f4 g7e8 26. g4g5 e8c7 27. b9a9 c7b9',
        '28. a9c9 e7c9 29. g5g6 b9c7 30. f4d4 f8f7',
        '31. a3a4 f9e8 32. e2g0 c5c4 33. d4c4 c7d5',
        '34. f6g4 i3g3 35. g4h6 d5f4 36. c0e2 g9e7',
        '37. c4e4 g3h3 38. g6g7 f7f6 39. h6g4 f6f5',
        '40. e4e6 f5g5 41. e6h6 h3g3 42. e1d2 g5g7',
        '43. h6h3 g3g1 44. e3e4 g1f1 45. h3e3 g7g5',
        '46. e4e5 i6i5 47. c2d4 i5i4 48. g4h2 f4g2',
        '49. e3f3 f1d1 50. d4f5 i4h4 51. f3f1 h4h3',
        '52. h2i0 g2h4 53. f1d1 h4f5 54. e5f5 g5f5',
        '55. i0g1 h3g3 56. g1i2 g3h3 57. d1a1 f5f4',
        '58. i2g1 h3g3 59. e2c0 f4e4 60. g1e2 g3f3',
        '61. d2e1 f3e3 62. e2g3 e4g4 63. g3f1 e3f3',
        '64. f1h2 g4f4 65. a1a3 f3g3 66. c0e2 g3h3',
        '67. h2f3 h3g3 68. f3d2 f4f3 69. a3a1 f3d3',
        '70. a4a5 g3f3 71. a1a4 f3e3 72. a4e4 1-0'
      ],
      expect: true
    },
    {
      fen: '3akc3/9/4ba3/r7p/P1bC5/9/8P/3AB1N2/4K1nR1/2B6 b - - 16 63',
      pgn: [
        '[Game "Chinese Chess"]',
        '[Event "1982年全国赛"]',
        '[Date "1982.12.11"]',
        '[Red "柳大华"]',
        '[Black "杨官璘"]',
        '[Result "1/2-1/2"]',
        '[Format "ICCS"]',
        '',
        '1. b2e2 b9c7 2. b0c2 a9b9 3. a0b0 h9g7',
        '4. g3g4 c6c5 5. b0b6 b7a7 6. b6c6 a7a8',
        '7. h0g2 f9e8 8. h2i2 a8c8 9. c6d6 c7b5',
        '10. i0h0 i9h9 11. c2e1 c5c4 12. d6d5 c8c3',
        '13. h0h6 b5d4 14. e2c2 b9b7 15. c2c4 b7d7',
        '16. g2f4 h7i7 17. h6g6 h9h2 18. g4g5 c3b3',
        '19. g5f5 b3b0 20. e1g2 d4f5 21. f0e1 h2h6',
        '22. d5c5 c9a7 23. g6h6 a7c5 24. h6h3 b0b3',
        '25. e3e4 b3b4 26. g0e2 b4e4 27. i2i1 i7i8',
        '28. i1g1 i8g8 29. c4c2 d7f7 30. c2b2 c5a7',
        '31. h3c3 f7b7 32. b2c2 b7f7 33. c2b2 f7b7',
        '34. b2a2 b7f7 35. a2a6 f5h4 36. a6b6 g9e7',
        '37. g1f1 h4f3 38. b6b3 f3g1 39. e0f0 g7f5',
        '40. c3e3 e6e5 41. b3b1 f7f6 42. e3g3 g8f8',
        '43. f1f2 g1i0 44. g3h3 f8f9 45. b1b5 i0g1',
        '46. h3h5 a7c5 47. b5e5 e4b4 48. a3a4 b4b3',
        '49. f2f3 b3b2 50. e1d2 b2b0 51. f0f1 b0d0',
        '52. a4a5 d0g0 53. f1e1 g0g2 54. f3f5 f9f5',
        '55. f4g2 f6b6 56. e1f1 f5f9 57. h5h1 b6e6',
        '58. e5d5 e8f7 59. f1e1 e6b6 60. a5b5 b6a6',
        '61. b5a5 a6b6 62. a5b5 b6a6 63. b5a5 1/2-1/2'
      ],
      expect: true
    },
    /*
    {
      // pgn without comments behind moves.
      fen: '2b2a3/3ka4/4b4/N8/8p/P5p2/4p4/9/4A4/4KAB2 b - - 0 43',
      pgn: [
        '[Game "Chinese Chess"]',
        '[Event "第一届全运会象棋决赛"]',
        '[Date "1959.??.??"]',
        '[Red "李义庭"]',
        '[Black "王嘉良"]',
        '[Result "1/2-1/2"]',
        '[Opening "五六炮对屏风马先进3卒"]',
        '[ECCO "C70"]',
        '',
        '1.  炮二平五    马８进７   2.  马二进三    卒３进１  ',
        '{黑方进3卒是屏风马应中炮的一种着法。一般认为，这种走法使后手方的作战计划暴露过早，',
        '因此，后手方必须十分熟悉这一布局的变化，才能应付裕如。黑方的用意在于，不让对方先进七兵，因为李义庭对中炮进七兵的布局尤其擅长}',
        '3.  车一平二    车９平８   4.  马八进九  ',
        '{过去，红棋的一方往往走巡河车，然后兑兵，',
        '如王再越在《梅花谱》中所介绍的，现在，这种走法比较不常见了，原因是它的变化已为大家所熟悉，容易成和。',
        '红方上边马之后，一般有炮八平六（五六炮）、炮八平七（五七炮）、炮八进四（五八炮，但须先进三兵）或车九进一的四种变化} ',
        '马２进３ 5.  炮八平六  ',
        '{红方选定五六炮的布局} ',
        '车１平２  ',
        '{黑方一般习见的走法是炮8进2，既防红右车过河，又封红左车，但红方可以进七兵先献，以后升右车捉死卒，红方仍保留先手。',
        '如改应马2进3封车，红方兵三进一，将来有炮六进三打马，黑方马2退3后再炮六进一打卒，一般认为演变下去对红方有利}',
        '6.  车九平八    象７进５  ',
        '{早作马回窝心新颖布局的准备} ',
        '7.  车八进六    卒７进１   8.  车八平七    马３退５  ',
        '{有句老话：“马回中心必定凶”。意思是，回窝心马的一方总是凶多吉少，但这是过去的看法，',
        '建国后象棋布局日新月异，早就打破了前人的常规。黑方不宜走马3进4，否则红炮打士得势}',
        '9.  车二进四  ',
        '{红车巡河比过河车路宽敞，但此时如改走炮五进四，得中卒后，仍有先手。兑去子力以后，局势比现在稍要简单一些。',
        '为谋求复杂变化的条件下斗智，寻找胜利的可能，红方的战术思想是：尽量保持战斗实力，争取主动} ',
        '炮２进５  ',
        '{为削弱红方中路攻势，进炮邀兑，这步棋是明智的}',
        '10. 兵九进一 ',
        '{挺边兵为边马开路，出马以后可以支援左车，是稳步进攻的着法} ',
        '炮８进１ 11. 车七进二    炮２平５   12. 相三进五    车２进３  ',
        '{黑方进车抢占要道，埋伏退炮打死车的阴谋}',
        '13. 马九进八    车２平４   14. 仕六进五    炮８退２   15. 车七退二    车４平３   ',
        '16. 马八进七    炮８平９ ',
        '{现在黑方平炮兑车，已为以后弃子夺先准备条件}',
        '17. 车二平四  ',
        '{红方避兑占四路要道比车二平六稳健。如果改走车二平六，粗看可以得士，但右翼容易受黑方威胁。',
        '如改走车二进五兑车，容易走成和局} ',
        '车８进７   18. 车四进四  ',
        '{这时，棋盘上逐渐出现紧张局势，红方下一步有马七进八准备挂角的杀机} ',
        '马５进３   19. 炮六进五 ',
        '{红方炮打马配合车攻击黑炮，来势汹汹} ',
        '车８平７   ',
        '20. 炮六平三    炮９进５ ',
        '{经过一阵搏杀，黑方实现了弃子夺先的战术计划}',
        '21. 炮三平七    炮９进３   22. 相五退三    车７进２   23. 车四平二    车７退３   ',
        '24. 车二退八    炮９退３  ',
        '{黑方虽失一子，但车炮控制要道，况5卒俱全，乍看起来，红方并不利。观至此，不禁为红方捏把汗}',
        '25. 炮七平八  ',
        '{既可以退炮打中卒，有可以进马压象田，红方此时借对攻达到积极防守的目的}',
        ' 炮９平５  ',
        '{炮轰中兵是棋势复杂化。如改走平车杀中兵，较为平稳，易成和局}',
        '26. 相七进五  ',
        '{经过惊涛骇浪之后，红方谨慎地补上一相。其实，改补相为上士（士五进四），则红方以车马炮单缺相对黑车炮多卒，',
        '谋攻谋和究竟都比较主动。但这时的局势千变万化，一时奥妙难测，在受竞赛时限的条件下要洞察其秘，毕竟是有困难的}',
        ' 炮５退１  ',
        '{黑方退炮后，黑车即将调往右翼，给红方以巨大的威胁} ',
        '27. 马七进六    士４进５   28. 炮八进二  象３进１ 29. 马六退八 将５平４ 30. 马八退六    炮５退１   ',
        '31. 炮八退四    车７平３  32. 炮八平五    卒５进１  ',
        '{为摆脱黑方的威胁，红方在以上几个回合中，马炮协作，以机警细致的着法步步紧迫黑方，终于兑去黑炮，平息了风波。',
        '现在的局势：红方车马兵单缺相，黑方车多卒士象全。以后双方残局着法工稳，终成正和} ',
        '33. 车二进四    车３平４   34. 马六进七    象１退３   35. 车二进二    车４退５   36. 车二平七    卒９进１ ',
        '37. 马七退六    车４平２   38. 车七退一    卒５进１   39. 车七平八    车２进３   40. 马六退八    卒５进１ ',
        '41. 马八进七    将４进１   42. 相五退三    卒７进１   43. 马七退九    1/2-1/2'
      ],
      expect: true
    },
    {
      // Load PGN with comment before first move
      fen: '2R6/5k2C/n8/p1p5p/6b2/6p2/9/9/9/4K4 b - - 0 38',
      pgn: [
        '[Game "Chinese Chess"]',
        '[Event "许银川让九子对聂棋圣"]',
        '[Site "广州"]',
        '[Date "1999.12.09"]',
        '[Red "许银川"]',
        '[Black "聂卫平"]',
        '[Result "1-0"]',
        '[FEN "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/9/1C5C1/9/RN2K2NR r - - 0 1"]',
        '{　　评注：许银川',
        '　　象棋让九子原属茶余饭后的娱乐，不意今日却被摆上赛桌，更为离奇的是：我的对手竟是在围棋棋坛上叱咤风云的聂大帅。赛前我并不了解对手的实力，但相信以聂棋圣在围棋上所体现出来的过人智慧，必能在棋理上触类旁通。因此我在赛前也作了一些准备，在对局中更是小心翼翼，不敢掉以轻心。',
        '　　许银川让去５只兵和双士双相，执红先行。棋盘如右图所示。当然，PGN文件里是无法嵌入图片的。}',
        '',
        '',
        '',
        '1. 炮八平五 炮８平５',
        '{　　红方首着架中炮必走之着，聂棋圣还架中炮拼兑子力，战术对头。}',
        '2. 炮五进五 象７进５ 3. 炮二平五',
        '{　　再架中炮也属正着，如改走马八进七，则象５退７，红方帅府受攻，当然若红方仍再架中炮拼兑，那么失去双炮就难有作用了。}',
        '马８进７ 4. 马二进三 车９平８ 5. 马八进七 马２进１ 6. 车九平六 车１平２',
        '{　　聂棋圣仍按常规战法出动主力，却忽略了红方车塞象眼的凶着，应走车１进１。}',
        '7. 车六进八',
        '{　　红车疾点象眼，局势霎时有剑拔弩张之感。这种对弈不能以常理揣度，红方只能像程咬金的三板斧一般猛攻一轮，若黑方防守得法则胜负立判。}',
        '炮２进７',
        '{　　却说聂棋圣见我来势汹汹，神色顿时颇为凝重，一番思索之后沉下底炮以攻为守，果是身手不凡。此着如改走炮２平３，则帅五平六，炮３进５，车六进一，将５进１，炮五退二，黑方不易驾驭局面。}',
        '8. 车一进四 炮２平１ 9. 马七进八 炮１退４ 10. 马八退七 炮１进４ 11. 马七进八 车２进２',
        '{　　其实黑方仍可走炮１退４，红方若续走马八退七，则仍炮１进４不变作和，因黑右车叫将红可车六退九，故不算犯规。}',
        '12. 炮五平八 炮１退４',
        '{　　劣着，导致失子，应走车２平３，红方如马八进六，则车３退１，红方无从着手。但有一点必须注意，黑车躲进暗道似与棋理相悖，故聂棋圣弃子以求局势缓和情有可原。}',
        '13. 炮八进五 炮１平９ 14. 炮八平三 车８进２ 15. 炮三进一 车８进２ 16. 马八进六 炮９平５',
        '17. 炮三平一 士６进５ 18. 马六进四 车８平５ 19. 帅五平六',
        '{　　可直接走马四进三叫将再踩中象。}',
        '车５平６ 20. 马四进三 将５平６ 21. 车六退四 卒５进１ 22. 车六进二 炮５平７',
        '23. 前马退二 象５进７ 24. 马二退三 卒５进１ 25. 车六平三 卒５平６ 26. 车三进三 将６进１',
        '27. 后马进二 士５进６ 28. 马二进三 将６平５ 29. 前马进二',
        '{　　红方有些拖沓，应直接走车三平六立成绝杀。}',
        '将５进１ 30. 车三平六 士６退５ 31. 马二退三 车６退１ 32. 车六退三',
        '{　　再擒一车，以下着法仅是聊尽人事而已。}',
        '车６平７ 33. 车六平三 卒６平７ 34. 车三平五 将５平６ 35. 帅六平五 将６退１',
        '36. 车五进二 将６退１ 37. 车五进一 将６进１ 38. 车五平七',
        '{　　至此，聂棋圣认负。与此同时，另一盘围棋对弈我被屠去一条大龙，已无力再战，遂平分秋色，皆大欢喜。}',
        '1-0'
      ],
      expect: true
    },
    */
  ];

  var newline_chars = ['\n', '<br />', '\r\n', 'BLAH'];

  tests.forEach(function(t, i) {
    newline_chars.forEach(function(newline, j) {
      it(i + String.fromCharCode(97 + j), function() {
        var sloppy = t.sloppy || false;
        var result = xiangqi.load_pgn(t.pgn.join(newline), {sloppy: sloppy,
          newline_char: newline});
        var should_pass = t.expect;

        // some tests are expected to fail
        if (should_pass) {

          // some PGN's tests contain comments which are stripped during parsing,
          // so we'll need compare the results of the load against a FEN string
          // (instead of the reconstructed PGN [e.g. test.pgn.join(newline)])
          if ('fen' in t) {
            assert(result && xiangqi.fen() === t.fen);
          } else {
            assert(result && xiangqi.pgn({ max_width: 45, newline_char: newline }) === t.pgn.join(newline));
          }

        } else {
          // this test should fail, so make sure it does
          assert(result === should_pass);
        }
      });

    });

  });

  // special case dirty file containing a mix of \n and \r\n
  it('dirty pgn', function() {
    var pgn =
      '[Event "1982年全国赛"]\n' +
      '[Date "1982.12.11"]\n' +
      '[Result "1/2-1/2"]\n' +
      '[Red "柳大华"]\r\n' +
      '[Black "杨官璘"]\n' +
      '[Format "ICCS"]\n' +
      '\r\n' +
      '1.  b2e2 b9c7 2.  b0c2 a9b9 3.  a0b0 h9g7\n' +
      '4.  g3g4 c6c5 5.  b0b6 b7a7 6.  b6c6 a7a8\n' +
      '7.  h0g2 f9e8 8.  h2i2 a8c8 9.  c6d6 c7b5\n' +
      '10. i0h0 i9h9 11. c2e1 c5c4 12. d6d5 c8c3\r\n' +
      '13. h0h6 b5d4 14. e2c2 b9b7 15. c2c4 b7d7\n' +
      '16. g2f4 h7i7 17. h6g6 h9h2 18. g4g5 c3b3\n' +
      '19. g5f5 b3b0 20. e1g2 d4f5 21. f0e1 h2h6\n' +
      '22. d5c5 c9a7 23. g6h6 a7c5 24. h6h3 b0b3\n' +
      '25. e3e4 b3b4 26. g0e2 b4e4 27. i2i1 i7i8\n' +
      '28. i1g1 i8g8 29. c4c2 d7f7 30. c2b2 c5a7\n' +
      '31. h3c3 f7b7 32. b2c2 b7f7 33. c2b2 f7b7\n' +
      '34. b2a2 b7f7 35. a2a6 f5h4 36. a6b6 g9e7\r\n' +
      '37. g1f1 h4f3 38. b6b3 f3g1 39. e0f0 g7f5\n' +
      '40. c3e3 e6e5 41. b3b1 f7f6 42. e3g3 g8f8\n' +
      '43. f1f2 g1i0 44. g3h3 f8f9 45. b1b5 i0g1\n' +
      '46. h3h5 a7c5 47. b5e5 e4b4 48. a3a4 b4b3\n' +
      '49. f2f3 b3b2 50. e1d2 b2b0 51. f0f1 b0d0\n' +
      '52. a4a5 d0g0 53. f1e1 g0g2 54. f3f5 f9f5\n' +
      '55. f4g2 f6b6 56. e1f1 f5f9 57. h5h1 b6e6\n' +
      '58. e5d5 e8f7 59. f1e1 e6b6 60. a5b5 b6a6\r\n' +
      '61. b5a5 a6b6 62. a5b5 b6a6 63. b5a5 1/2-1/2';

    var result = xiangqi.load_pgn(pgn, { newline_char: '\r?\n' });
    assert(result);

    assert(xiangqi.load_pgn(pgn));
    assert(xiangqi.pgn().match(/^\[\[/) === null);
  });

});


describe('Make Move', function() {

  var positions = [
    {fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r - - 0 1',
     legal: true,
     move: 'e3e4',
     next: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/4P4/P1P3P1P/1C5C1/9/RNBAKABNR b - - 1 1'},
    {fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r - - 0 1',
     legal: false,
     move: 'e3e5'},
    {fen: '2ba5/4a4/b4k3/2R6/9/9/9/9/9/4K4 r - - 0 1',
     legal: true,
     move: 'c6f6',
     next: '2ba5/4a4/b4k3/5R3/9/9/9/9/9/4K4 b - - 1 1'},
    // Cannon
    {fen: 'rn1akabr1/9/1c2b1n1c/pC2p1p1p/2p6/6P2/P1P1P3P/2N1C1N2/9/R1BAKAB1R r - - 0 1',
     legal: true,
     move: 'b6g6',
     next: 'rn1akabr1/9/1c2b1n1c/p3p1C1p/2p6/6P2/P1P1P3P/2N1C1N2/9/R1BAKAB1R b - - 0 1',
     captured: 'p'},
    {fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r - - 0 1',
     legal: true,
     move: 'h2h9',
     next: 'rnbakabCr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C7/9/RNBAKABNR b - - 0 1',
     captured: 'n'},
    {fen: 'rnbakabCr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C7/9/RNBAKABNR b - - 0 1',
     legal: true,
     move: 'b7b0',
     next: 'rnbakabCr/9/7c1/p1p1p1p1p/9/9/P1P1P1P1P/1C7/9/RcBAKABNR r - - 0 2',
     captured: 'n'},
    // Knight
    {fen: 'rnbakabCr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C7/9/RNBAKABNR b - - 0 1',
     legal: false,
     move: 'b9d8'},
    {fen: 'rnbakabCr/9/7c1/p1p1p1p1p/9/9/P1P1P1P1P/1C7/9/RcBAKABNR r - - 0 2',
     legal: false,
     move: 'h0f1'},

    //  // strict move parser
    // {fen: 'r2qkbnr/ppp2ppp/2n5/1B2pQ2/4P3/8/PPP2PPP/RNB1K2R b KQkq - 3 7',
    //  legal: true,
    //  next: 'r2qkb1r/ppp1nppp/2n5/1B2pQ2/4P3/8/PPP2PPP/RNB1K2R r KQkq - 4 8',
    //  move: 'Ne7'},
    //
    //  // strict move parser should reject over disambiguation
    // {fen: 'r2qkbnr/ppp2ppp/2n5/1B2pQ2/4P3/8/PPP2PPP/RNB1K2R b KQkq - 3 7',
    //  legal: false,
    //  move: 'Nge7'},
    //
    //  // sloppy move parser
    // {fen: 'r2qkbnr/ppp2ppp/2n5/1B2pQ2/4P3/8/PPP2PPP/RNB1K2R b KQkq - 3 7',
    //  legal: true,
    //  sloppy: true,
    //  move: 'Nge7',
    //  next: 'r2qkb1r/ppp1nppp/2n5/1B2pQ2/4P3/8/PPP2PPP/RNB1K2R r KQkq - 4 8'},
    //
    //  // the sloppy parser should still accept correctly disambiguated moves
    // {fen: 'r2qkbnr/ppp2ppp/2n5/1B2pQ2/4P3/8/PPP2PPP/RNB1K2R b KQkq - 3 7',
    //  legal: true,
    //  sloppy: true,
    //  move: 'Ne7',
    //  next: 'r2qkb1r/ppp1nppp/2n5/1B2pQ2/4P3/8/PPP2PPP/RNB1K2R r KQkq - 4 8'}
  ];

  positions.forEach(function(position) {
    var xiangqi = new Xiangqi();
    xiangqi.load(position.fen);
    it(position.fen + ' (' + position.move + ' ' + position.legal + ')', function() {
      var sloppy = position.sloppy || false;
      var result = xiangqi.move(position.move, {sloppy: sloppy});
      if (position.legal) {
        assert(result &&
          xiangqi.fen() === position.next &&
          result.captured === position.captured);
      } else {
        assert(!result);
      }
    });

  });

});


describe('Validate FEN', function() {

  var xiangqi = new Xiangqi();
  var positions = [
    {fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNRr - - 0 1',   error_number: 1},
    {fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r - - 0 x',  error_number: 2},
    {fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r - - 0 0',  error_number: 2},
    {fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r - - 0 -1', error_number: 2},
    {fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r - - x 1',  error_number: 3},
    {fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r - - -1 1', error_number: 3},
    {fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r - x 0 1', error_number: 4},
    {fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r - 0 0 1',  error_number: 4},
    {fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r x - 0 1', error_number: 5},
    {fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r 0 - 0 1',  error_number: 5},
    {fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR ? - - 0 1',  error_number: 6},
    {fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9 r - - 0 1',            error_number: 7},
    {fen: 'rnbakabnr/17/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r - - 0 1', error_number: 8},
    {fen: 'rnbaka?nr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r - - 0 1',  error_number: 9},
    {fen: 'rnbakabnr/8/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r - - 0 1',  error_number: 10},
    {fen: 'rnbakabnr/9/1c5c1/p1p1p1p1pp/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r - - 0 1', error_number: 10},/*
    {fen: 'r1bqkbnr/2pppppp/n7/1p6/8/4P3/PPPP1PPP/RNBQK1NR b KQkq b6 0 4', error_number: 11},
    {fen: 'rnbqkbnr/1p1ppppp/B1p5/8/6P1/4P3/PPPP1P1P/RNBQK1NR r KQkq g3 0 3', error_number: 11},
    {fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR r KQkq - 0 1',  error_number: 0},
    {fen: 'rnbqkbnr/pppp1ppp/8/4p3/2P5/8/PP1PPPPP/RNBQKBNR r KQkq e6 0 2', error_number: 0},
    {fen: '3r2k1/p1q2pp1/2nr1n1p/2p1p3/4P2B/P1P2Q1P/B4PP1/1R2R1K1 b - - 3 20', error_number: 0},
    {fen: 'r2q1rk1/3bbppp/p3pn2/1p1pB3/3P4/1QNBP3/PP3PPP/R4RK1 r - - 4 13', error_number: 0},
    {fen: 'rnbqk2r/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R r KQkq - 1 5', error_number: 0},
    {fen: '1k1rr3/1p5p/p1Pp2q1/3nppp1/PB6/3P4/3Q1PPP/1R3RK1 b - - 0 28', error_number: 0},
    {fen: 'r3r1k1/3n1pp1/2q1p2p/2p5/p1p2P2/P3P2P/1PQ2BP1/1R2R1K1 r - - 0 27', error_number: 0},
    {fen: 'r3rbk1/1R3p1p/3Pq1p1/6B1/p6P/5Q2/5PP1/3R2K1 b - - 3 26', error_number: 0},
    {fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R r KQkq - 2 3', error_number: 0},
    {fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R r KQkq - 2 3', error_number: 0},
    {fen: 'r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R r KQkq - 2 5', error_number: 0},
    {fen: 'r1b2rk1/4bppp/p1np4/q3p1P1/1p2P2P/4BP2/PPP1N1Q1/1K1R1B1R r - - 0 17', error_number: 0},
    {fen: 'r2q1rk1/ppp1bppp/2np1nb1/4p3/P1B1P1P1/3P1N1P/1PP2P2/RNBQR1K1 r - - 1 10', error_number: 0},
    {fen: 'r2qkb1r/pb1n1p2/4pP2/1ppP2B1/2p5/2N3P1/PP3P1P/R2QKB1R b KQkq - 0 13', error_number: 0},
    {fen: '3k1b1r/p2n1p2/5P2/2pN4/P1p2B2/1p3qP1/1P2KP2/3R4 r - - 0 29', error_number: 0},
    {fen: 'rnbq1rk1/1pp1ppbp/p2p1np1/8/2PPP3/2N1BP2/PP2N1PP/R2QKB1R b KQ - 1 7', error_number: 0},
    {fen: 'rn1qkb1r/pb1p1ppp/1p2pn2/4P3/2Pp4/5NP1/PP1N1PBP/R1BQK2R b KQkq - 0 8', error_number: 0},
    {fen: 'rnbqkbnr/pp1p1ppp/4p3/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R r KQkq - 0 3', error_number: 0},
    {fen: 'r1bq1rk1/pp2ppbp/3p1np1/8/3pPP2/3B4/PPPPN1PP/R1BQ1RK1 r - - 4 10', error_number: 0},
    {fen: 'r1b3k1/5pbp/2N1p1p1/p6q/2p2P2/2P1B3/PPQ3PP/3R2K1 b - - 0 22', error_number: 0},
    {fen: 'rnbqkb1r/ppp1pppp/3p1n2/8/3PP3/8/PPP2PPP/RNBQKBNR r KQkq - 1 3', error_number: 0},
    {fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq d3 0 4', error_number: 0},
    {fen: 'r1bqk2r/ppp1bppp/2n5/3p4/3Pn3/3B1N2/PPP2PPP/RNBQ1RK1 r kq - 4 8', error_number: 0},
    {fen: '4kb1r/1p3pp1/p3p3/4P1BN/1n1p1PPP/PR6/1P4r1/1KR5 b k - 0 24', error_number: 0},
    {fen: 'r3kb1r/pbpp1ppp/1qp1n3/4P3/2P5/1N2Q3/PP1B1PPP/R3KB1R r KQkq - 7 13', error_number: 0},
    {fen: 'r1b1r1k1/p4p1p/2pb2p1/3pn3/N7/4BP2/PPP2KPP/3RRB2 b - - 3 18', error_number: 0},
    {fen: 'r1b2rk1/p2nqp1p/3P2p1/2p2p2/2B5/1PB3N1/P4PPP/R2Q2K1 b - - 0 18', error_number: 0},
    {fen: 'rnb1k2r/1p3ppp/p3Pn2/8/3N2P1/2q1B3/P1P1BP1P/R2Q1K1R b kq - 1 12', error_number: 0},
    {fen: 'rnb1k2r/1pq1bppp/p2ppn2/8/3NPP2/2N1B3/PPP1B1PP/R2QK2R r KQkq - 1 9', error_number: 0},
    {fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', error_number: 0},
    {fen: '4r3/1pr3pk/p2p2q1/3Pppbp/8/1NPQ1PP1/PP2R2P/1K1R4 r - - 8 28', error_number: 0},
    {fen: 'b2r3r/4kp2/p3p1p1/1p2P3/1P1n1P2/P1NB4/KP4P1/3R2R1 b - - 2 26', error_number: 0},
    {fen: 'rnbqk2r/ppppppbp/5np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR b KQkq e3 0 4', error_number: 0},
    {fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', error_number: 0},
    {fen: 'rn1q1rk1/pbp2pp1/1p3b1p/3p4/3P4/2NBPN2/PP3PPP/2RQK2R b K - 1 11', error_number: 0},
    {fen: '2rq1rk1/pp1bppbp/3p1np1/8/2BNP3/2N1BP2/PPPQ2PP/1K1R3R b - - 0 13', error_number: 0},
    {fen: 'r2qkb1r/1p1bpppp/p1np4/6B1/B3P1n1/2PQ1N2/PP3PPP/RN2R1K1 b kq - 0 10', error_number: 0},
    {fen: 'r1bq1rk1/1p2npb1/p6p/3p2p1/3P3B/2N5/PP2BPPP/R2QR1K1 r - - 0 15', error_number: 0},
    {fen: 'r3r1k1/pbq1bppp/4pnn1/2p1B1N1/2P2P2/1P1B2N1/P3Q1PP/4RRK1 b - - 4 17', error_number: 0},
    {fen: '4k3/5p2/p1q1pbp1/1pr1P3/3n1P2/1B2B2Q/PP3P2/3R3K r - - 1 28', error_number: 0},
    {fen: '2k4r/pp1r1p1p/8/2Pq1p2/1Pn2P2/PQ3NP1/3p1NKP/R7 b - - 0 28', error_number: 0},
    {fen: 'rnbqkb1r/ppp2ppp/3p1n2/4N3/4P3/8/PPPP1PPP/RNBQKB1R r KQkq - 0 4', error_number: 0},
    {fen: '3r1rk1/Qpp2p1p/7q/1P2P1p1/2B1Rn2/6NP/P4P1P/5RK1 b - - 0 22', error_number: 0},
    {fen: 'rn2kb1r/2qp1ppp/b3pn2/2pP2B1/1pN1P3/5P2/PP4PP/R2QKBNR r KQkq - 4 11', error_number: 0},
    {fen: 'r3k2r/pp1nbp1p/2p2pb1/3p4/3P3N/2N1P3/PP3PPP/R3KB1R r KQkq - 4 12', error_number: 0},
    {fen: 'rn1qr1k1/pbppbppp/1p3n2/3P4/8/P1N1P1P1/1P2NPBP/R1BQK2R b KQ - 2 10', error_number: 0},
    {fen: 'r1bqk2r/pp1nbppp/2p2n2/3p2B1/3P4/2N1PN2/PP3PPP/R2QKB1R r KQkq - 1 8', error_number: 0},
    {fen: 'r1bqk2r/pppp1pp1/2n2n1p/8/1bPN3B/2N5/PP2PPPP/R2QKB1R b KQkq - 1 7', error_number: 0},
    {fen: 'r1bqk2r/1pppbppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQ1RK1 r kq - 4 6', error_number: 0},
    {fen: 'r1b1kb1r/p2p1ppp/1qp1p3/3nP3/2P1NP2/8/PP4PP/R1BQKB1R b KQkq c3 0 10', error_number: 0},
    {fen: '8/R7/2b5/3k2K1/P1p1r3/2B5/1P6/8 b - - 8 74', error_number: 0},
    {fen: '2q5/5pk1/5p1p/4b3/1p1pP3/7P/1Pr3P1/R2Q1RK1 r - - 14 37', error_number: 0},
    {fen: 'r4rk1/1bqnbppp/p2p4/1p2p3/3BPP2/P1NB4/1PP3PP/3RQR1K r - - 0 16', error_number: 0},
    {fen: 'r1bqk2r/pp1n1ppp/2pbpn2/6N1/3P4/3B1N2/PPP2PPP/R1BQK2R r KQkq - 2 8', error_number: 0},
    {fen: 'r1b1kb1r/pp3ppp/1qnppn2/8/2B1PB2/1NN5/PPP2PPP/R2QK2R b KQkq - 1 8', error_number: 0},
    {fen: '1r3r1k/2q1n1pb/pn5p/1p2pP2/6B1/PPNRQ2P/2P1N1P1/3R3K b - - 0 28', error_number: 0},
    {fen: 'rnbqk2r/ppp1bppp/4pn2/3p2B1/2PP4/2N2N2/PP2PPPP/R2QKB1R b KQkq - 3 5', error_number: 0},
    {fen: '2r3k1/5pp1/p2p3p/1p1Pp2P/5b2/8/qP1K2P1/3QRB1R r - - 0 26', error_number: 0},
    {fen: '6k1/1Q3p2/2p1r3/B1Pn2p1/3P1b1p/5P1P/5P2/5K2 r - - 6 47', error_number: 0},
    {fen: '8/k7/Pr2R3/7p/8/4n1P1/1r2p1P1/4R1K1 r - - 0 59', error_number: 0},
    {fen: '8/3k4/1nbPp2p/1pK2np1/p7/PP1R1P2/2P4P/4R3 b - - 7 34', error_number: 0},
    {fen: '4rbk1/rnR2p1p/pp2pnp1/3p4/3P4/1P2PB1P/P2BNPP1/R5K1 b - - 0 20', error_number: 0},
    {fen: '5r2/6pk/8/p3P1p1/1R6/7Q/1Pr2P1K/2q5 b - - 2 48', error_number: 0},
    {fen: '1br2rk1/2q2pp1/p3bnp1/1p1p4/8/1PN1PBPP/PB1Q1P2/R2R2K1 b - - 0 19', error_number: 0},
    {fen: '4r1k1/b4p2/p4pp1/1p6/3p1N1P/1P2P1P1/P4P2/3R2K1 r - - 0 30', error_number: 0},
    {fen: '3rk3/1Q4p1/p3p3/4RPqp/4p2P/P7/KPP5/8 b - h3 0 33', error_number: 0},
    {fen: '6k1/1p1r1pp1/5qp1/p1pBP3/Pb3n2/1Q1RB2P/1P3PP1/6K1 b - - 0 28', error_number: 0},
    {fen: '3r2k1/pp2bp2/1q4p1/3p1b1p/4PB1P/2P2PQ1/P2R2P1/3R2K1 r - - 1 28', error_number: 0},
    {fen: '3r4/p1qn1pk1/1p1R3p/2P1pQpP/8/4B3/5PP1/6K1 r - - 0 35', error_number: 0},
    {fen: 'rnb1k1nr/pp2q1pp/2pp4/4pp2/2PPP3/8/PP2NPPP/R1BQKB1R r KQkq f6 0 8', error_number: 0},
    {fen: 'rnbqkbnr/pp1ppppp/2p5/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2', error_number: 0},
    {fen: '4q1k1/6p1/p2rnpPp/1p2p3/7P/1BP5/PP3Q2/1K3R2 r - - 0 34', error_number: 0},
    {fen: '3r2k1/p1q2pp1/1n2rn1p/1B2p3/P1p1P3/2P3BP/4QPP1/1R2R1K1 b - - 1 25', error_number: 0},
    {fen: '8/p7/1b2BkR1/5P2/4K3/7r/P7/8 b - - 9 52', error_number: 0},
    {fen: '2rq2k1/p4p1p/1p1prp2/1Ppb4/8/P1QPP1P1/1B3P1P/R3R1K1 r - - 2 20', error_number: 0},
    {fen: '8/1pQ3bk/p2p1qp1/P2Pp2p/NP6/7P/5PP1/6K1 r - - 1 36', error_number: 0},
    {fen: '8/1pQ3bk/p2p2p1/P2Pp2p/1P5P/2N3P1/2q2PK1/8 b - - 0 39', error_number: 0},
    {fen: 'r1bq1rk1/pp2n1bp/2pp1np1/3PppN1/1PP1P3/2N2B2/P4PPP/R1BQR1K1 r - - 0 13', error_number: 0},
    {fen: '1r4k1/5p2/3P2pp/p3Pp2/5q2/2Q2P1P/5P2/4R1K1 r - - 0 29', error_number: 0},
    {fen: 'rnbqkbnr/pp2pppp/3p4/8/3pP3/5N2/PPP2PPP/RNBQKB1R r KQkq - 0 4', error_number: 0},
    {fen: 'R2qk2r/2p2ppp/1bnp1n2/1p2p3/3PP1b1/1BP2N2/1P3PPP/1NBQ1RK1 b k - 0 11', error_number: 0},
    {fen: '6k1/4qp2/3p2p1/3Pp2p/7P/4Q1P1/5PBK/8 b - - 20 57', error_number: 0},
    {fen: '3k4/r3q3/3p1p2/2pB4/P7/7P/6P1/1Q4K1 b - - 6 43', error_number: 0},
    {fen: '5k2/1n4p1/2p2p2/p2q1B1P/P4PK1/6P1/1Q6/8 b - - 4 46', error_number: 0},
    {fen: '6k1/pr2pb2/5pp1/1B1p4/P7/4QP2/1PP3Pq/2KR4 r - - 1 27', error_number: 0},
    {fen: '1rbqk2r/2pp1ppp/2n2n2/1pb1p3/4P3/1BP2N2/1P1P1PPP/RNBQ1RK1 b k - 0 9', error_number: 0},
    {fen: '6r1/2p5/pbpp1k1r/5b2/3P1N1p/1PP2N1P/P4R2/2K1R3 r - - 4 33', error_number: 0},
    {fen: 'rnbqkb1r/pppppppp/5n2/8/3P4/5N2/PPP1PPPP/RNBQKB1R b KQkq - 2 2', error_number: 0},
    {fen: 'rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2', error_number: 0},
    {fen: '4b3/5p1k/r7/p3BNQp/4P1pP/1r1n4/1P3P1N/7K b - - 2 40', error_number: 0},
    {fen: 'r2q1rk1/pb1p2pp/1p1bpnn1/5p2/2PP4/PPN1BP1P/2B1N1P1/1R1Q1R1K b - - 2 16', error_number: 0},
    {fen: 'rnbqkbnr/ppp1pppp/8/8/2pP4/5N2/PP2PPPP/RNBQKB1R b KQkq - 1 3', error_number: 0},
    {fen: '4rrk1/8/p1pR4/1p6/1PPKNq2/3P1p2/PB5n/R2Q4 b - - 6 40', error_number: 0},
    {fen: 'r1bqk1nr/1p2bppp/p1np4/4p3/2P1P3/N1N5/PP3PPP/R1BQKB1R b KQkq - 1 8', error_number: 0},
    {fen: 'r1bqk2r/pp2bppp/2n1p3/3n4/3P4/2NB1N2/PP3PPP/R1BQ1RK1 b kq - 3 9', error_number: 0},
    {fen: 'r1bqkbnr/pppp2pp/2n5/1B2p3/3Pp3/5N2/PPP2PPP/RNBQK2R r KQkq - 0 5', error_number: 0},
    {fen: '2n1r3/p1k2pp1/B1p3b1/P7/5bP1/2N1B3/1P2KP2/2R5 b - - 4 25', error_number: 0},
    {fen: 'r4rk1/2q3pp/4p3/p1Pn1p2/1p1P4/4PP2/1B1Q2PP/R3R1K1 r - - 0 22', error_number: 0},
    {fen: '8/8/1p6/3b4/1P1k1p2/8/3KBP2/8 r - - 2 68', error_number: 0},
    {fen: '2b2k2/1p5p/2p5/p1p1q3/2PbN3/1P5P/P5B1/3RR2K r - - 4 33', error_number: 0},
    {fen: '1b6/5kp1/5p2/1b1p4/1P6/4PPq1/2Q2RNp/7K b - - 2 41', error_number: 0},
    {fen: 'r3r1k1/p2nqpp1/bpp2n1p/3p4/B2P4/P1Q1PP2/1P2NBPP/R3K2R r KQ - 6 16', error_number: 0},
    {fen: 'r3k2r/8/p4p2/3p2p1/4b3/2R2PP1/P6P/4R1K1 b kq - 0 27', error_number: 0},
    {fen: 'r1rb2k1/5ppp/pqp5/3pPb2/QB1P4/2R2N2/P4PPP/2R3K1 b - - 7 23', error_number: 0},
    {fen: '3r1r2/3P2pk/1p1R3p/1Bp2p2/6q1/4Q3/PP3P1P/7K r - - 4 30', error_number: 0},*/
  ];

  positions.forEach(function(position) {

    it(position.fen + ' (valid: ' + (position.error_number  === 0) + ')', function() {
      var result = xiangqi.validate_fen(position.fen);
      assert(result.error_number === position.error_number, result.error_number);
    });

  });
});


describe('History', function() {

  var xiangqi = new Xiangqi();
  var tests = [
     {verbose: false,
      fen: '4k4/5R3/5a3/8p/p4r3/9/8P/4B1C2/4A4/3K1A3 b - - 1 40',
      moves: ['h2e2', 'h9g7', 'g3g4', 'c6c5', 'b2b6', 'i9h9', 'h0g2', 'h7i7',
        'b0c2', 'c9e7', 'b6g6', 'b9c7', 'a0b0', 'b7b5', 'b0b4', 'a6a5', 'c3c4',
        'c5c4', 'b4c4', 'c7d5', 'c2d4', 'h9h6', 'g6g9', 'e7g9', 'c4c5', 'b5b2',
        'c5d5', 'b2g2', 'i0i2', 'g2g3', 'i2g2', 'g3a3', 'g4g5', 'a9c9', 'g5g6',
        'h6h1', 'd4f5', 'c9c0', 'f5g7', 'a3a0', 'g2f2', 'f9e8', 'e2e6', 'e8f7',
        'f2d2', 'c0c9', 'd0e1', 'h1h7', 'e0d0', 'i7g7', 'd5d9', 'c9d9', 'd2d9',
        'e9e8', 'd9d8', 'e8e9', 'g0e2', 'a0b0', 'd8d9', 'e9e8', 'd9g9', 'b0b7',
        'g9g8', 'e8e9', 'g6f6', 'b7b5', 'e3e4', 'b5g5', 'g8f8', 'g5f5', 'e6e5',
        'g7g5', 'e5g5', 'h7h6', 'e4e5', 'h6f6', 'e5f5', 'f6f5', 'g5g2' ]},
     {verbose: true,
      fen: '4k4/5R3/5a3/8p/p4r3/9/8P/4B1C2/4A4/3K1A3 b - - 1 40',
      moves: [
        {color: 'r', from: 'h2', to: 'e2', flags: 'n', piece: 'c', iccs: 'h2e2' },
        {color: 'b', from: 'h9', to: 'g7', flags: 'n', piece: 'n', iccs: 'h9g7' },
        {color: 'r', from: 'g3', to: 'g4', flags: 'n', piece: 'p', iccs: 'g3g4' },
        {color: 'b', from: 'c6', to: 'c5', flags: 'n', piece: 'p', iccs: 'c6c5' },
        {color: 'r', from: 'b2', to: 'b6', flags: 'n', piece: 'c', iccs: 'b2b6' },
        {color: 'b', from: 'i9', to: 'h9', flags: 'n', piece: 'r', iccs: 'i9h9' },
        {color: 'r', from: 'h0', to: 'g2', flags: 'n', piece: 'n', iccs: 'h0g2' },
        {color: 'b', from: 'h7', to: 'i7', flags: 'n', piece: 'c', iccs: 'h7i7' },
        {color: 'r', from: 'b0', to: 'c2', flags: 'n', piece: 'n', iccs: 'b0c2' },
        {color: 'b', from: 'c9', to: 'e7', flags: 'n', piece: 'b', iccs: 'c9e7' },
        {color: 'r', from: 'b6', to: 'g6', flags: 'c', piece: 'c', captured: 'p', iccs: 'b6g6' },
        {color: 'b', from: 'b9', to: 'c7', flags: 'n', piece: 'n', iccs: 'b9c7' },
        {color: 'r', from: 'a0', to: 'b0', flags: 'n', piece: 'r', iccs: 'a0b0' },
        {color: 'b', from: 'b7', to: 'b5', flags: 'n', piece: 'c', iccs: 'b7b5' },
        {color: 'r', from: 'b0', to: 'b4', flags: 'n', piece: 'r', iccs: 'b0b4' },
        {color: 'b', from: 'a6', to: 'a5', flags: 'n', piece: 'p', iccs: 'a6a5' },
        {color: 'r', from: 'c3', to: 'c4', flags: 'n', piece: 'p', iccs: 'c3c4' },
        {color: 'b', from: 'c5', to: 'c4', flags: 'c', piece: 'p', captured: 'p', iccs: 'c5c4' },
        {color: 'r', from: 'b4', to: 'c4', flags: 'c', piece: 'r', captured: 'p', iccs: 'b4c4' },
        {color: 'b', from: 'c7', to: 'd5', flags: 'n', piece: 'n', iccs: 'c7d5' },
        {color: 'r', from: 'c2', to: 'd4', flags: 'n', piece: 'n', iccs: 'c2d4' },
        {color: 'b', from: 'h9', to: 'h6', flags: 'n', piece: 'r', iccs: 'h9h6' },
        {color: 'r', from: 'g6', to: 'g9', flags: 'c', piece: 'c', captured: 'b', iccs: 'g6g9' },
        {color: 'b', from: 'e7', to: 'g9', flags: 'c', piece: 'b', captured: 'c', iccs: 'e7g9' },
        {color: 'r', from: 'c4', to: 'c5', flags: 'n', piece: 'r', iccs: 'c4c5' },
        {color: 'b', from: 'b5', to: 'b2', flags: 'n', piece: 'c', iccs: 'b5b2' },
        {color: 'r', from: 'c5', to: 'd5', flags: 'c', piece: 'r', captured: 'n', iccs: 'c5d5' },
        {color: 'b', from: 'b2', to: 'g2', flags: 'c', piece: 'c', captured: 'n', iccs: 'b2g2' },
        {color: 'r', from: 'i0', to: 'i2', flags: 'n', piece: 'r', iccs: 'i0i2' },
        {color: 'b', from: 'g2', to: 'g3', flags: 'n', piece: 'c', iccs: 'g2g3' },
        {color: 'r', from: 'i2', to: 'g2', flags: 'n', piece: 'r', iccs: 'i2g2' },
        {color: 'b', from: 'g3', to: 'a3', flags: 'c', piece: 'c', captured: 'p', iccs: 'g3a3' },
        {color: 'r', from: 'g4', to: 'g5', flags: 'n', piece: 'p', iccs: 'g4g5' },
        {color: 'b', from: 'a9', to: 'c9', flags: 'n', piece: 'r', iccs: 'a9c9' },
        {color: 'r', from: 'g5', to: 'g6', flags: 'n', piece: 'p', iccs: 'g5g6' },
        {color: 'b', from: 'h6', to: 'h1', flags: 'n', piece: 'r', iccs: 'h6h1' },
        {color: 'r', from: 'd4', to: 'f5', flags: 'n', piece: 'n', iccs: 'd4f5' },
        {color: 'b', from: 'c9', to: 'c0', flags: 'c', piece: 'r', captured: 'b', iccs: 'c9c0' },
        {color: 'r', from: 'f5', to: 'g7', flags: 'c', piece: 'n', captured: 'n', iccs: 'f5g7' },
        {color: 'b', from: 'a3', to: 'a0', flags: 'n', piece: 'c', iccs: 'a3a0' },
        {color: 'r', from: 'g2', to: 'f2', flags: 'n', piece: 'r', iccs: 'g2f2' },
        {color: 'b', from: 'f9', to: 'e8', flags: 'n', piece: 'a', iccs: 'f9e8' },
        {color: 'r', from: 'e2', to: 'e6', flags: 'c', piece: 'c', captured: 'p', iccs: 'e2e6' },
        {color: 'b', from: 'e8', to: 'f7', flags: 'n', piece: 'a', iccs: 'e8f7' },
        {color: 'r', from: 'f2', to: 'd2', flags: 'n', piece: 'r', iccs: 'f2d2' },
        {color: 'b', from: 'c0', to: 'c9', flags: 'n', piece: 'r', iccs: 'c0c9' },
        {color: 'r', from: 'd0', to: 'e1', flags: 'n', piece: 'a', iccs: 'd0e1' },
        {color: 'b', from: 'h1', to: 'h7', flags: 'n', piece: 'r', iccs: 'h1h7' },
        {color: 'r', from: 'e0', to: 'd0', flags: 'n', piece: 'k', iccs: 'e0d0' },
        {color: 'b', from: 'i7', to: 'g7', flags: 'c', piece: 'c', captured: 'n', iccs: 'i7g7' },
        {color: 'r', from: 'd5', to: 'd9', flags: 'c', piece: 'r', captured: 'a', iccs: 'd5d9' },
        {color: 'b', from: 'c9', to: 'd9', flags: 'c', piece: 'r', captured: 'r', iccs: 'c9d9' },
        {color: 'r', from: 'd2', to: 'd9', flags: 'c', piece: 'r', captured: 'r', iccs: 'd2d9' },
        {color: 'b', from: 'e9', to: 'e8', flags: 'n', piece: 'k', iccs: 'e9e8' },
        {color: 'r', from: 'd9', to: 'd8', flags: 'n', piece: 'r', iccs: 'd9d8' },
        {color: 'b', from: 'e8', to: 'e9', flags: 'n', piece: 'k', iccs: 'e8e9' },
        {color: 'r', from: 'g0', to: 'e2', flags: 'n', piece: 'b', iccs: 'g0e2' },
        {color: 'b', from: 'a0', to: 'b0', flags: 'n', piece: 'c', iccs: 'a0b0' },
        {color: 'r', from: 'd8', to: 'd9', flags: 'n', piece: 'r', iccs: 'd8d9' },
        {color: 'b', from: 'e9', to: 'e8', flags: 'n', piece: 'k', iccs: 'e9e8' },
        {color: 'r', from: 'd9', to: 'g9', flags: 'c', piece: 'r', captured: 'b', iccs: 'd9g9' },
        {color: 'b', from: 'b0', to: 'b7', flags: 'n', piece: 'c', iccs: 'b0b7' },
        {color: 'r', from: 'g9', to: 'g8', flags: 'n', piece: 'r', iccs: 'g9g8' },
        {color: 'b', from: 'e8', to: 'e9', flags: 'n', piece: 'k', iccs: 'e8e9' },
        {color: 'r', from: 'g6', to: 'f6', flags: 'n', piece: 'p', iccs: 'g6f6' },
        {color: 'b', from: 'b7', to: 'b5', flags: 'n', piece: 'c', iccs: 'b7b5' },
        {color: 'r', from: 'e3', to: 'e4', flags: 'n', piece: 'p', iccs: 'e3e4' },
        {color: 'b', from: 'b5', to: 'g5', flags: 'n', piece: 'c', iccs: 'b5g5' },
        {color: 'r', from: 'g8', to: 'f8', flags: 'n', piece: 'r', iccs: 'g8f8' },
        {color: 'b', from: 'g5', to: 'f5', flags: 'n', piece: 'c', iccs: 'g5f5' },
        {color: 'r', from: 'e6', to: 'e5', flags: 'n', piece: 'c', iccs: 'e6e5' },
        {color: 'b', from: 'g7', to: 'g5', flags: 'n', piece: 'c', iccs: 'g7g5' },
        {color: 'r', from: 'e5', to: 'g5', flags: 'c', piece: 'c', captured: 'c', iccs: 'e5g5' },
        {color: 'b', from: 'h7', to: 'h6', flags: 'n', piece: 'r', iccs: 'h7h6' },
        {color: 'r', from: 'e4', to: 'e5', flags: 'n', piece: 'p', iccs: 'e4e5' },
        {color: 'b', from: 'h6', to: 'f6', flags: 'c', piece: 'r', captured: 'p', iccs: 'h6f6' },
        {color: 'r', from: 'e5', to: 'f5', flags: 'c', piece: 'p', captured: 'c', iccs: 'e5f5' },
        {color: 'b', from: 'f6', to: 'f5', flags: 'c', piece: 'r', captured: 'p', iccs: 'f6f5' },
        {color: 'r', from: 'g5', to: 'g2', flags: 'n', piece: 'c', iccs: 'g5g2' }]}
  ];

  tests.forEach(function(t, i) {
    var passed = true;
    var j;

    it(i.toString(), function() {
      xiangqi.reset();

      for (j = 0; j < t.moves.length; j++) {
        xiangqi.move(t.moves[j]);
      }

      var history = xiangqi.history({verbose: t.verbose});
      if (t.fen !== xiangqi.fen()) {
        passed = false;
      } else if (history.length !== t.moves.length) {
        passed = false;
      } else {
        for (j = 0; j < t.moves.length; j++) {
          if (!t.verbose) {
            if (history[j] !== t.moves[j]) {
              passed = false;
              break;
            }
          } else {
            for (var key in history[j]) {
              if (history[j][key] !== t.moves[j][key]) {
                passed = false;
                break;
              }
            }
          }
        }
      }
      assert(passed);
    });

  });
});


describe('Board Tests', function() {

  var tests = [
    {fen: 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR r - - 0 1',
      board: [[{type: 'r', color: 'b'},
        {type: 'n', color: 'b'},
        {type: 'b', color: 'b'},
        {type: 'a', color: 'b'},
        {type: 'k', color: 'b'},
        {type: 'a', color: 'b'},
        {type: 'b', color: 'b'},
        {type: 'n', color: 'b'},
        {type: 'r', color: 'b'}],
        [null, null, null, null, null, null, null, null, null],
        [null,{type: 'c', color: 'b'},null, null, null, null, null,{type: 'c', color: 'b'}, null],
        [{type: 'p', color: 'b'}, null,
          {type: 'p', color: 'b'}, null,
          {type: 'p', color: 'b'}, null,
          {type: 'p', color: 'b'}, null,
          {type: 'p', color: 'b'}],
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [{type: 'p', color: 'r'}, null,
          {type: 'p', color: 'r'}, null,
          {type: 'p', color: 'r'}, null,
          {type: 'p', color: 'r'}, null,
          {type: 'p', color: 'r'}],
        [null,{type: 'c', color: 'r'},null, null, null, null, null,{type: 'c', color: 'r'}, null],
        [null, null, null, null, null, null, null, null, null],
        [{type: 'r', color: 'r'},
          {type: 'n', color: 'r'},
          {type: 'b', color: 'r'},
          {type: 'a', color: 'r'},
          {type: 'k', color: 'r'},
          {type: 'a', color: 'r'},
          {type: 'b', color: 'r'},
          {type: 'n', color: 'r'},
          {type: 'r', color: 'r'}]]},
    // checkmate
    {fen: '5kC2/4a1N2/3a5/9/9/9/9/r3C4/4p4/2rK4R r - - 0 8',
      board:[[null, null, null, null, null, {type: 'k', color: 'b'}, {type: 'c', color: 'r'}, null, null],
        [null, null, null, null, {type: 'a', color: 'b'}, null, {type: 'n', color: 'r'}, null, null],
        [null, null, null, {type: 'a', color: 'b'}, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [{type: 'r', color: 'b'}, null, null, null, {type: 'c', color: 'r'}, null, null, null, null],
        [null, null, null, null, {type: 'p', color: 'b'}, null, null, null, null],
        [null, null, {type: 'r', color: 'b'}, {type: 'k', color: 'r'}, null, null, null, null, {type: 'r', color: 'r'}]
      ]}
  ];


  tests.forEach(function(test) {
    it('Board - ' + test.fen, function() {
      var xiangqi = new Xiangqi(test.fen);
      assert(JSON.stringify(xiangqi.board()) === JSON.stringify(test.board));
    });
  });
});

/*
describe('Regression Tests', function() {
  it('Github Issue #32 - castling flag reappearing', function() {
    var xiangqi = new Xiangqi('b3k2r/5p2/4p3/1p5p/6p1/2PR2P1/BP3qNP/6QK b k - 2 28');
    xiangqi.move({from:'a8', to:'g2'});
    assert(xiangqi.fen() === '4k2r/5p2/4p3/1p5p/6p1/2PR2P1/BP3qbP/6QK r k - 0 29');
  });

  it('Github Issue #58 - placing more than one king', function() {
    var xiangqi = new Xiangqi('N3k3/8/8/8/8/8/5b2/4K3 r - - 0 1');
    assert(xiangqi.put({type: 'k', color: 'r'}, 'a1') === false);
    xiangqi.put({type: 'q', color: 'r'}, 'a1');
    xiangqi.remove('a1');
    assert(xiangqi.moves().join(' ') === 'Kd2 Ke2 Kxf2 Kf1 Kd1');
  });

  it('Github Issue #85 (white) - SetUp and FEN should be accepted in load_pgn', function() {
       var xiangqi = new Xiangqi();
       var pgn = ['[SetUp "1"]', '[FEN "7k/5K2/4R3/8/8/8/8/8 r KQkq - 0 1"]', "", '1. Rh6#'];
       var result = xiangqi.load_pgn(pgn.join('\n'));
       assert(result);
       assert(xiangqi.fen() === '7k/5K2/7R/8/8/8/8/8 b KQkq - 1 1');
  });

  it('Github Issue #85 (black) - SetUp and FEN should be accepted in load_pgn', function() {
       var xiangqi = new Xiangqi();
       var pgn = ['[SetUp '1']', '[FEN 'r4r1k/1p4b1/3p3p/5qp1/1RP5/6P1/3NP3/2Q2RKB b KQkq - 0 1']', "", '1. ... Qc5+'];
       var result = xiangqi.load_pgn(pgn.join('\n'));
       assert(result);
       assert(xiangqi.fen() === 'r4r1k/1p4b1/3p3p/2q3p1/1RP5/6P1/3NP3/2Q2RKB r KQkq - 1 2');
  });

  it('Github Issue #98 (white) - Wrong movement number after setting a position via FEN', function () {
    var xiangqi = new Xiangqi();
    xiangqi.load('4r3/8/2p2PPk/1p6/pP2p1R1/P1B5/2P2K2/3r4 r - - 1 45');
    xiangqi.move('f7');
    var result = xiangqi.pgn();
    assert(result.match(/(45\. f7)$/));
  });

  it('Github Issue #98 (black) - Wrong movement number after setting a position via FEN', function () {
    var xiangqi = new Xiangqi();
    xiangqi.load('4r3/8/2p2PPk/1p6/pP2p1R1/P1B5/2P2K2/3r4 b - - 1 45');
    xiangqi.move('Rf1+');
    var result = xiangqi.pgn();
    assert(result.match(/(45\. \.\.\. Rf1\+)$/));
  });

  it('Github Issue #129 load_pgn() should not clear headers if PGN contains SetUp and FEN tags', function () {
    var pgn = [
      '[Event "Test Olympiad"]',
      '[Site "Earth"]',
      '[Date "????.??.??"]',
      '[Round "6"]',
      '[Red "Testy"]',
      '[Black "McTest"]',
      '[Result "*"]',
      '[FEN "rnbqkb1r/1p3ppp/p2ppn2/6B1/3NP3/2N5/PPP2PPP/R2QKB1R r KQkq - 0 1"]',
      '[SetUp "1"]',
      '',
      '1.Qd2 Be7 *'
    ];

    var xiangqi = new Xiangqi();
    var result = xiangqi.load_pgn(pgn.join('\n'));
    var expected = {
      Event: 'Test Olympiad',
      Site: 'Earth',
      Date: '????.??.??',
      Round: '6',
      Red: 'Testy',
      Black: 'McTest',
      Result: '*',
      FEN: 'rnbqkb1r/1p3ppp/p2ppn2/6B1/3NP3/2N5/PPP2PPP/R2QKB1R r KQkq - 0 1',
      SetUp: '1'
    };
    assert.deepEqual(xiangqi.header(), expected);
  });

  it('Github Issue #129 clear() should clear the board and delete all headers with the exception of SetUp and FEN', function () {
    var pgn = [
      '[Event "Test Olympiad"]',
      '[Site "Earth"]',
      '[Date "????.??.??"]',
      '[Round "6"]',
      '[Red "Testy"]',
      '[Black "McTest"]',
      '[Result "*"]',
      '[FEN "rnbqkb1r/1p3ppp/p2ppn2/6B1/3NP3/2N5/PPP2PPP/R2QKB1R r KQkq - 0 1"]',
      '[SetUp "1"]',
      '',
      '1.Qd2 Be7 *'
    ];

    var xiangqi = new Xiangqi();
    var result = xiangqi.load_pgn(pgn.join('\n'));
    xiangqi.clear();
    var expected = {
      FEN: '8/8/8/8/8/8/8/8 r - - 0 1',
      SetUp: '1'
    };
    assert.deepEqual(xiangqi.header(), expected);
  })
});
*/